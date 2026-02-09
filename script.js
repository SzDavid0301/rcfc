const DISCORD_WEBHOOK = "IDE_MASOLD_A_LINKET";

// BEÁLLÍTÁSOK
const COOLDOWN_TIME = 5000; 
const BAN_TIME = 300000; // 5 perc ms-ban
let utolsoUzenetIdeje = 0;

// Káromkodás lista
const csunyaSzavak = ["kurva", "geci", "fasz", "bazmeg", "buzi", "anyád"];

// TILTÁS ELLENŐRZÉSE BETÖLTÉSKOR
window.onload = function() {
    ellenorizTiltast();
};

// KILÉPÉS ELLENI VÉDELEM (F5 figyelmeztetés)
window.onbeforeunload = function() {
    const chatLathato = !document.getElementById('chat-panel').classList.contains('hidden');
    if (chatLathato || localStorage.getItem('tiltasVege')) {
        return "A folyamatban lévő beszélgetés megszakad!";
    }
};

function ellenorizTiltast() {
    const tiltasVege = localStorage.getItem('tiltasVege');
    const chatInputArea = document.querySelector('.chat-input-area');

    if (tiltasVege && Date.now() < tiltasVege) {
        // Még tart a tiltás
        document.getElementById('calc-panel').classList.add('hidden');
        document.getElementById('chat-panel').classList.remove('hidden');
        chatInputArea.style.visibility = "hidden";
        
        const hatralevoPerc = Math.ceil((tiltasVege - Date.now()) / 60000);
        kiirAdmin("Rendszer", `❌ Még tiltva vagy! Hátralévő idő: kb. ${hatralevoPerc} perc.`);

        // Időzítő a feloldáshoz
        setTimeout(() => {
            localStorage.removeItem('tiltasVege');
            chatInputArea.style.visibility = "visible";
            kiirAdmin("Bot", "A tiltás lejárt, most már viselkedj rendesen!");
        }, tiltasVege - Date.now());
    }
}

function tiltasInditasa() {
    const lejarat = Date.now() + BAN_TIME;
    localStorage.setItem('tiltasVege', lejarat); // Elmentjük a böngészőbe
    
    const chatInputArea = document.querySelector('.chat-input-area');
    kiirAdmin("Bot", "❌ A beszélgetést trágár beszéd miatt lezártam. 5 percig tiltva vagy, az oldal frissítése sem segít!");
    
    chatInputArea.style.visibility = "hidden";

    if (DISCORD_WEBHOOK !== "IDE_MASOLD_A_LINKET") {
        fetch(DISCORD_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: `⚠️ **Súlyos Tiltás!** Egy felhasználót 5 percre kitiltottam káromkodásért.` })
        });
    }

    setTimeout(() => {
        localStorage.removeItem('tiltasVege');
        chatInputArea.style.visibility = "visible";
        kiirAdmin("Bot", "A tiltás lejárt.");
    }, BAN_TIME);
}

function botValaszol(userSzoveg) {
    if (localStorage.getItem('tiltasVege')) return;
    
    const uzenet = userSzoveg.toLowerCase();
    const talaltCsunyaSzo = csunyaSzavak.some(szo => uzenet.includes(szo));

    if (talaltCsunyaSzo) {
        tiltasInditasa();
        return;
    }

    let valaszok = [
        "Értem, feljegyeztem!",
        "Rendben, továbbítom!",
        "Kérlek várj, hamarosan jön egy admin.",
        "Vettem az adást!"
    ];
    let valasz = valaszok[Math.floor(Math.random() * valaszok.length)];
    
    setTimeout(() => { kiirAdmin("Bot", valasz); }, 1500);
}

function kuld() {
    if (localStorage.getItem('tiltasVege')) return;

    const most = Date.now();
    const bemenet = document.getElementById('msgInput');
    const szoveg = bemenet.value.trim();

    if (szoveg === "" || most - utolsoUzenetIdeje < COOLDOWN_TIME) return;

    const nev = document.getElementById('pName').value || "Játékos";
    kiirUser(nev, szoveg);
    bemenet.value = "";
    utolsoUzenetIdeje = most;
    botValaszol(szoveg);
}

function inditas() {
    if (localStorage.getItem('tiltasVege')) {
        alert("Még tart a tiltásod!");
        return;
    }
    
    const nev = document.getElementById('pName').value;
    const osszeg = parseFloat(document.getElementById('pAmount').value);
    const irany = document.getElementById('pDirection').value;

    if (!nev || isNaN(osszeg)) return alert("Hiányzó adatok!");

    let eredmeny = (irany === 'fc-to-rc') ? osszeg * 2 : osszeg / 2;
    let kapott = (irany === 'fc-to-rc') ? "RC" : "FC";
    let leadott = (irany === 'fc-to-rc') ? "FC" : "RC";

    document.getElementById('calc-panel').classList.add('hidden');
    document.getElementById('chat-panel').classList.remove('hidden');

    const chat = document.getElementById('chat-logs');
    chat.innerHTML = ""; 
    kiirUser(nev, `Szeretnék üzletelni! **${osszeg} ${leadott}** -> **${eredmeny} ${kapott}**`);
    
    setTimeout(() => {
        kiirAdmin("Bot", `Szia ${nev}! Megkaptam az ajánlatod.`);
    }, 1000);
}

function vissza() {
    if (localStorage.getItem('tiltasVege')) return;
    document.getElementById('chat-panel').classList.add('hidden');
    document.getElementById('calc-panel').classList.remove('hidden');
}

function kiirUser(nev, szoveg) {
    const chat = document.getElementById('chat-logs');
    chat.innerHTML += `<div class="msg user"><b>${nev}:</b><br>${szoveg}</div>`;
    chat.scrollTop = chat.scrollHeight;
}

function kiirAdmin(nev, szoveg) {
    const chat = document.getElementById('chat-logs');
    chat.innerHTML += `<div class="msg admin"><b>${nev}:</b><br>${szoveg}</div>`;
    chat.scrollTop = chat.scrollHeight;
}

document.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        const chatNyitva = !document.getElementById('chat-panel').classList.contains('hidden');
        if (chatNyitva) kuld(); else inditas();
    }
});