const display = document.getElementById('display');
const stateDisplay = document.getElementById('state-display');
const pushbutton = document.getElementById('pushbutton');
const slotEls = document.querySelectorAll('.slot');

//traduzione messaggi di stato in arrivo
const STATE_MAP = {
    "DISENGAGED":      "DISENGAGED",
    "ENGAGED":         "ENGAGED",
    "OUT_OF_SERVICE":  "OUT OF SERVICE",
};

// classi CSS sullo state box: state-idle | state-busy | state-oos
const STATE_CLASS = {
    "DISENGAGED":      "state-idle",
    "ENGAGED":         "state-busy",
    "OUT_OF_SERVICE":  "state-oos",
};

function translateState(raw) {
    return STATE_MAP[raw] ?? raw;
}

function updateStateDisplay(raw) {
    stateDisplay.textContent = translateState(raw);
    stateDisplay.className = '';           // reset
    const cls = STATE_CLASS[raw];
    if (cls) stateDisplay.classList.add(cls);
}

let awaitingResponse = false;
let fallbackTimer = null;

function setButtonEnabled(enabled) {
    awaitingResponse = !enabled;
    pushbutton.classList.toggle('disabled', !enabled);
}

async function sendLoadRequest() {
    if (awaitingResponse) return; // ignora click mentre aspettiamo una risposta

    setButtonEnabled(false);

    // rete di sicurezza: se non arriva nessuna risposta entro 15s,
    // riabilitiamo comunque il pulsante per non restare bloccati
    clearTimeout(fallbackTimer);
    fallbackTimer = setTimeout(() => setButtonEnabled(true), 1000);

    try {
        await fetch('/push');
        // niente "sending...": il display resta sull'ultimo messaggio
        // ricevuto dal QAK finché non ne arriva uno nuovo via SSE,
        // così si possono mandare più richieste di seguito senza problemi
    } catch (err) {
        display.textContent = "connection error";
        setButtonEnabled(true);
        clearTimeout(fallbackTimer);
    }
}

pushbutton.addEventListener('click', sendLoadRequest);

function updateSlots(slots) {
    slots.forEach((full, i) => {
        if (slotEls[i]) {
            slotEls[i].classList.toggle('full', full);
        }
    });
}

// canale di push dal server: testo per il display + stato degli slot
const events = new EventSource('/events');

events.onmessage = (e) => {
    const msg = JSON.parse(e.data);

    if (msg.type === 'text') {
        display.textContent = msg.text;
        clearTimeout(fallbackTimer);
        setButtonEnabled(true);
        // dopo una risposta testuale aggiorna lo stato degli slot
        setTimeout(() => fetch('/refresh-status').catch(() => {}), 1500);
    } else if (msg.type === 'state') {
        updateStateDisplay(msg.state);
    } else if (msg.type === 'slots') {
        updateSlots(msg.slots);
    }
};

events.onerror = () => {
    console.warn("SSE connection lost, il browser tenterà la riconnessione automaticamente...");
};

// all'avvio
display.textContent = "ready";
fetch('/refresh-status').catch(() => {});