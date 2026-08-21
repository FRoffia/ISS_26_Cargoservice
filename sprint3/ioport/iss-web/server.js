const express = require('express');
const mqtt = require('mqtt');
const path = require('path');

const app = express();
const PORT = 3000;

// topic QAK → web
const DISPLAY_TOPIC    = "display";         // risposte testuali (pushbuttonservice + cargoservice)
const STATE_TOPIC      = "state";           // stato sistema (stateservice)
const HOLDSTATUS_TOPIC = "holdstatus";      // occupazione slot (holdstatusservice)

// topic web → QAK
const PUSHBUTTON_TOPIC         = "pushbutton";
const HOLDSTATUS_REQUEST_TOPIC = "holdstatusrequest";

// ---------------------------------------------------------------------------
// MAPPA MESSAGGI TESTUALI (box "Risposta")
//
// Chiave  = payload atomico emesso dal QAK (esatto, case-sensitive)
// Valore  = testo da mostrare sulla pagina web
//
// Fonte dei payload nel codice QAK:
//   slot1…slot4        → sprint3.qak  cargoservice  State send_accept  (slot prenotato)
//   "no_slots_avail"   → sprint3.qak  cargoservice  State load_rejected
//   "already_occupied" → sprint3.qak  cargoservice  State retry_later
//   "out_of_service"   → sprint3.qak  cargoservice  State reply_oos
//   "not_arrived"      → sprint3.qak  cargoservice  State cargo_timeout
// ---------------------------------------------------------------------------
const TEXT_MAP = {
    "slot1":            "Carico accettato, posizionare carico alla IOPort",
    "slot2":            "Carico accettato, posizionare carico alla IOPort",
    "slot3":            "Carico accettato, posizionare carico alla IOPort",
    "slot4":            "Carico accettato, posizionare carico alla IOPort",
    "no_slots_avail":   "Carico rifiutato, hold piena",
    "already_occupied": "IOPort occupata, riprova più tardi",
    "out_of_service":   "Out of service, riprova più tardi",
    "not_arrived":      "Nessun cargo arrivato in IOPort, timeout",
};

function translateMessage(raw) {
    return TEXT_MAP[raw.trim()] ?? raw;
}

// --- parsing formato messaggi QAK ---
// msg(msgId,msgType,sender,receiver,content,num)
function parseQakMsg(str) {
    const firstParen = str.indexOf('(');
    const lastParen  = str.lastIndexOf(')');
    if (firstParen === -1 || lastParen === -1) throw new Error("formato non riconosciuto: " + str);

    const inner = str.slice(firstParen + 1, lastParen);
    const parts = [];
    let depth = 0, current = '';

    for (const ch of inner) {
        if (ch === '(') depth++;
        if (ch === ')') depth--;
        if (ch === ',' && depth === 0) { parts.push(current); current = ''; }
        else current += ch;
    }
    parts.push(current);

    if (parts.length < 6) throw new Error("campi mancanti: " + str);
    return { msgId: parts[0], msgType: parts[1], msgSender: parts[2],
             msgReceiver: parts[3], msgContent: parts[4], msgNum: parts[5] };
}

function extractArg(msgContent) {
    const start = msgContent.indexOf('(');
    const end   = msgContent.lastIndexOf(')');
    if (start === -1 || end === -1) return msgContent;
    return msgContent.slice(start + 1, end);
}

// --- MQTT ---
const client = mqtt.connect("mqtt://192.168.178.81:1883");

let sseClients = [];
function broadcast(data) {
    sseClients.forEach(res => res.write(`data: ${JSON.stringify(data)}\n\n`));
}

let msgCounter = 0;
function makeMsg(msgId, content) {
    msgCounter = (msgCounter + 1) % 1000000;
    return `msg(${msgId},event,web,none,${content},${msgCounter})`;
}

client.on('connect', () => {
    console.log("MQTT connected");
    client.subscribe([DISPLAY_TOPIC, STATE_TOPIC, HOLDSTATUS_TOPIC]);
    client.publish(HOLDSTATUS_REQUEST_TOPIC, makeMsg("hold_status_request", "hold_status_request(1)"));
});

client.on('message', (topic, payload) => {
    let arg;
    try {
        arg = extractArg(parseQakMsg(payload.toString()).msgContent).trim();
    } catch (err) {
        console.error("Messaggio non valido su topic", topic, ":", payload.toString());
        return;
    }

    console.log(`[${topic}]`, arg);

    if (topic === STATE_TOPIC) {
        broadcast({ type: "state", state: arg });
    } else if (topic === HOLDSTATUS_TOPIC) {
        const slots = arg.split('').map(c => c === '1');
        broadcast({ type: "slots", slots });
    } else {
        broadcast({ type: "text", text: translateMessage(arg) });
    }
});

// --- frontend ---
app.use(express.static(path.join(__dirname, 'public')));

app.get('/events', (req, res) => {
    res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    res.flushHeaders();
    sseClients.push(res);
    req.on('close', () => { sseClients = sseClients.filter(c => c !== res); });
});

app.get('/push', (req, res) => {
    client.publish(PUSHBUTTON_TOPIC, makeMsg("push", "push(1)"));
    res.json({ status: "sent" });
});

app.get('/refresh-status', (req, res) => {
    client.publish(HOLDSTATUS_REQUEST_TOPIC, makeMsg("hold_status_request", "hold_status_request(1)"));
    res.sendStatus(204);
});

app.listen(PORT, () => console.log(`Web interface running at http://localhost:${PORT}`));
