const DISCORD_WEBHOOK = "IDE_MASOLD_A_LINKET";

const COOLDOWN_TIME = 5000; 
const BAN_TIME = 300000; 
const MIN_LIMIT = 1000; 
let utolsoUzenetIdeje = 0;

const csunyaSzavak = ["kurva", "geci", "fasz", "bazmeg", "buzi", "anyád"];

window.onload = function() {
    ellenorizTiltast();
};

// Segédfüggvény a hiba kiírásához az oldalon
function hibaKiiras(szoveg) {
    const hibaDiv = document.getElementById('error-msg');
    if (hibaDiv) {
        hibaDiv.innerText = szoveg;
    }
}

function ellenorizTiltast() {
    const tiltasVege = localStorage.getItem('tiltasVege');
    const chatInputArea = document.querySelector('.chat-input-area');

    if (tiltasVege && Date.now() < tiltasVege) {
        document.getElementById('calc-panel').classList.add('hidden');
        document.getElementById('chat-panel').classList.remove('hidden');
        chatInputArea.style.visibility = "hidden";
        
        const hatralevoPerc = Math.ceil((tiltasVege - Date.now()) / 60000);
        kiirAdmin("Rendszer", `❌ Még tiltva vagy! Hátralévő idő: kb. ${hatralevoPerc} perc.`);

        setTimeout(() => {
            localStorage.removeItem('tiltasVege');
            chatInputArea.style.visibility = "visible";
            kiirAdmin("Bot", "A tiltás lejárt, most már írhatsz!");
        }, tiltasVege - Date.now());
    }
}

function tiltasInditasa() {
    const lejarat = Date.now() + BAN_TIME;
    localStorage.setItem('tiltasVege', lejarat);
    
    const chatInputArea = document.querySelector('.chat-input-area');
    kiirAdmin("Bot", "❌ A beszélgetést trágár beszéd miatt lezártam. 5 percig nem használhatod az oldalt.");
    chatInputArea.style.visibility = "hidden";

    if (DISCORD_WEBHOOK !== "IDE_MASOLD_A_LINKET") {
        fetch(DISCORD_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: `⚠️ **Tiltás!** Valaki káromkodott.` })
        });
    }
}

function botValaszol(userSzoveg) {
    if (localStorage.getItem('tiltasVege')) return;
    const uzenet = userSzoveg.toLowerCase();
    
    const talaltCsunyaSzo = csunyaSzavak.some(szo => uzenet.includes(szo));
    if (talaltCsunyaSzo) {
        tiltasInditasa();
        return;
    }

    let valasz = "";
    if (uzenet.includes("?") && (uzenet.includes("mikor") || uzenet.includes("idő"))) {
        valasz = "Általában 5-10 perc, türelmedet kérjük!";
    } 
    else if (uzenet.includes("vagy itt") || uzenet.includes("haló")) {
        valasz = "Igen, az ajánlatodat rögzítettem, hamarosan érkezik egy admin!";
    }
    else if (uzenet.includes("szia") || uzenet.includes("helló")) {
        valasz = "Szia! Kérlek várj, amíg feldolgozzuk a kérésed.";
    }
    else {
        const alapok = ["Értem!", "Rendben!", "Továbbítottam!", "Vettem!"];
        valasz = alapok[Math.floor(Math.random() * alapok.length)];
    }

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
    if (localStorage.getItem('tiltasVege')) return;
    
    // Hibaüzenet alaphelyzetbe állítása
    hibaKiiras("");

    const nev = document.getElementById('pName').value;
    const osszegInput = document.getElementById('pAmount').value;
    const osszeg = parseFloat(osszegInput);
    const irany = document.getElementById('pDirection').value;

    if (!nev || isNaN(osszeg)) {
        hibaKiiras("Kérlek töltsd ki az adatokat!");
        return;
    }

    if (osszeg < MIN_LIMIT) {
        hibaKiiras(`Minimum váltás: ${MIN_LIMIT}!`);
        return;
    }

    let eredmeny = (irany === 'fc-to-rc') ? osszeg * 2 : osszeg / 2;
    let kapott = (irany === 'fc-to-rc') ? "RC" : "FC";
    let leadott = (irany === 'fc-to-rc') ? "FC" : "RC";

    document.getElementById('calc-panel').classList.add('hidden');
    document.getElementById('chat-panel').classList.remove('hidden');

    const chat = document.getElementById('chat-logs');
    chat.innerHTML = ""; 
    kiirUser(nev, `Üzletelni szeretnék: **${osszeg} ${leadott}** -> **${eredmeny} ${kapott}**`);
    
    setTimeout(() => {
        kiirAdmin("Bot", `Szia ${nev}! Továbbítottam az igényedet az adminok felé.`);
    }, 1000);

    if (DISCORD_WEBHOOK !== "IDE_MASOLD_A_LINKET") {
        fetch(DISCORD_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                content: `🚀 **Üzlet!** | **Név:** ${nev} | **Összeg:** ${osszeg} ${leadott} | **Kapna:** ${eredmeny} ${kapott}` 
            })
        });
    }
}

function vissza() {
    if (localStorage.getItem('tiltasVege')) return;
    document.getElementById('chat-panel').classList.add('hidden');
    document.getElementById('calc-panel').classList.remove('hidden');
    hibaKiiras(""); // Visszalépéskor töröljük a hibaüzenetet
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