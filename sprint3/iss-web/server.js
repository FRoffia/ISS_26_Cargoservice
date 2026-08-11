const express = require('express');
const mqtt = require('mqtt');
const path = require('path');

const app = express();
const PORT = 3000;

//configurazione MQTT
const MQTT_URL = "mqtt://192.168.178.81:1883";
const PUSHBUTTON_TOPIC = "pushbutton";
const DISPLAY_TOPIC = "display";
const HOLDSTATUS_REQUEST_TOPIC = "holdstatusrequest";
const NUM_SLOTS = 4;

//traduzione messaggi in arrivo
const TEXT_MAP = {
    "slot1": "Carico accettato, Slot 1 prenotato",
    "slot2": "Carico accettato, Slot 2 prenotato",
    "slot3": "Carico accettato, Slot 3 prenotato",
    "slot4": "Carico accettato, Slot 4 prenotato",
    "load_rejected": "Carico rifiutato, hold piena",
    "out_of_service": "Out of service, riprova più tardi",
    "already_occupied":   "IOPort occupata, riprova più tardi",
    "not_arrived":   "Nessun cargo arrivato in IOPort, timeout",
};

function translateMessage(raw) {
    return TEXT_MAP[raw.trim()] ?? raw;
}

// rileva messaggi di stato del sistema: tutto MAIUSCOLO (lettere, underscore, spazi)
function isSystemState(arg) {
    const s = arg.trim();
    return s.length > 0 && /^[A-Z][A-Z_\s]+$/.test(s);
}

// prova a interpretare arg come stato degli slot, in vari formati possibili
// ("0101", "0,1,0,1", "true,false,true,false", "[false, true, false, false]", ecc.)
// ritorna un array di booleani lungo NUM_SLOTS, oppure null se non è uno stato slot
function parseSlotStatus(arg) {
    const cleaned = arg.replace(/[\[\]\s]/g, '');

    if (new RegExp(`^[01]{${NUM_SLOTS}}$`).test(cleaned)) {
        return cleaned.split('').map(c => c === '1');
    }

    const digitParts = cleaned.split(',').filter(Boolean);
    if (digitParts.length === NUM_SLOTS && digitParts.every(p => p === '0' || p === '1')) {
        return digitParts.map(p => p === '1');
    }

    const boolMatches = cleaned.match(/true|false/g);
    if (boolMatches && boolMatches.length === NUM_SLOTS) {
        return boolMatches.map(b => b === 'true');
    }

    return null;
}

// --- MQTT TCP ---
const client = mqtt.connect(MQTT_URL);

// browser collegati via SSE
let sseClients = [];

function broadcast(data) {
    sseClients.forEach(res => res.write(`data: ${JSON.stringify(data)}\n\n`));
}

// --- Parsing/serializzazione del formato messaggi QAK ---
// I messaggi sul bus QAK NON sono JSON, hanno questa forma testuale:
//   msg(msgId,msgType,msgSender,msgReceiver,msgContent,msgNum)
// msgContent può a sua volta contenere parentesi (es. display_web(Message)),
// quindi lo split va fatto rispettando la profondità delle parentesi.

function parseQakMsg(str) {
    const firstParen = str.indexOf('(');
    const lastParen = str.lastIndexOf(')');
    if (firstParen === -1 || lastParen === -1) {
        throw new Error("formato messaggio non riconosciuto: " + str);
    }

    const inner = str.slice(firstParen + 1, lastParen);
    const parts = [];
    let depth = 0;
    let current = '';

    for (const ch of inner) {
        if (ch === '(') depth++;
        if (ch === ')') depth--;

        if (ch === ',' && depth === 0) {
            parts.push(current);
            current = '';
        } else {
            current += ch;
        }
    }
    parts.push(current);

    if (parts.length < 6) {
        throw new Error("campi mancanti nel messaggio: " + str);
    }

    return {
        msgId: parts[0],
        msgType: parts[1],
        msgSender: parts[2],
        msgReceiver: parts[3],
        msgContent: parts[4],
        msgNum: parts[5]
    };
}

// contatore piccolo per msgNum: Date.now() ha 13 cifre e sfora l'Int a 32 bit
// usato lato QAK, causando "For input string" nel parsing
let msgCounter = 0;

function makeMsg(msgId, content) {
    msgCounter = (msgCounter + 1) % 1000000;
    return `msg(${msgId},event,web,none,${content},${msgCounter})`;
}

// estrae l'argomento tra parentesi da un msgContent tipo "display_web(0101)"
function extractArg(msgContent) {
    const start = msgContent.indexOf('(');
    const end = msgContent.lastIndexOf(')');
    if (start === -1 || end === -1) return msgContent;
    return msgContent.slice(start + 1, end);
}

client.on('connect', () => {
    console.log("MQTT connected");
    client.subscribe(DISPLAY_TOPIC);

    //appena connessi chiediamo subito lo stato attuale degli slot
    client.publish(HOLDSTATUS_REQUEST_TOPIC, makeMsg("hold_status_request", "hold_status_request(1)"));
});

client.on('message', (topic, payload) => {
    if (topic !== DISPLAY_TOPIC) return;

    const raw = payload.toString();
    let msg;
    try {
        msg = parseQakMsg(raw);
    } catch (err) {
        console.error("Messaggio su 'display' non valido:", raw);
        return;
    }

    const arg = extractArg(msg.msgContent || "").trim();
    console.log("Display event:", arg);

    const slots = parseSlotStatus(arg);
    if (slots) {
        broadcast({ type: "slots", slots });
    } else if (isSystemState(arg)) {
        broadcast({ type: "state", state: arg.trim() });
    } else {
        broadcast({ type: "text", text: translateMessage(arg) });
    }
});

// --- Serviamo frontend ---
app.use(express.static(path.join(__dirname, 'public')));

// --- SSE: il browser si iscrive qui per ricevere testo e stato slot ---
app.get('/events', (req, res) => {
    res.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
    });
    res.flushHeaders();

    sseClients.push(res);

    req.on('close', () => {
        sseClients = sseClients.filter(c => c !== res);
    });
});

// --- Pulsante LOAD premuto sul browser ---
app.get('/push', (req, res) => {
    console.log("Sending push event...");
    client.publish(PUSHBUTTON_TOPIC, makeMsg("push", "push(1)"));

    // la risposta vera (accepted/rejected/retrylater) arriva in modo asincrono
    // sul topic "display" e viene inoltrata al browser via SSE
    res.json({ status: "sent" });
});

// --- richiesta manuale di aggiornamento stato slot (es. al caricamento pagina) ---
app.get('/refresh-status', (req, res) => {
    client.publish(HOLDSTATUS_REQUEST_TOPIC, makeMsg("hold_status_request", "hold_status_request(1)"));
    res.sendStatus(204);
});

app.listen(PORT, () => {
    console.log(`Web interface running at http://localhost:${PORT}`);
});