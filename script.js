const DISCORD_WEBHOOK = "IDE_MASOLD_A_LINKET";
const MIN_LIMIT = 1000;
const BAN_TIME = 300000; 
const csunyaSzavak = ["kurva", "geci", "fasz", "bazmeg", "buzi", "anyád"];

window.onload = function() {
    ellenorizTiltast();
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            if (!document.getElementById('chat-panel').classList.contains('hidden')) kuld();
            else inditas();
        }
    });

    setInterval(ellenorizTiltast, 10000); 
};

// ÉKEZETMENTESÍTŐ FÜGGVÉNY (Hogy a bot bárhogy megértse)
function ekezetmentesites(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function ellenorizTiltast() {
    const tiltasVege = localStorage.getItem('tiltas_lejarat');
    if (tiltasVege) {
        const hatralevoIdo = tiltasVege - Date.now();
        if (hatralevoIdo > 0) {
            const percek = Math.floor(hatralevoIdo / 60000);
            const masodpercek = Math.floor((hatralevoIdo % 60000) / 1000);
            
            document.getElementById('calc-panel').classList.add('hidden');
            document.getElementById('chat-panel').classList.remove('hidden');
            document.querySelector('.chat-input-area').style.display = "none";
            
            const l = document.getElementById('chat-logs');
            l.innerHTML = `<div class="msg-wrapper admin-wrapper"><div class="msg admin"><b>Rendszer</b>⚠️ Némítva vagy!<br>Hátralévő idő: <b>${percek}p ${masodpercek}mp</b></div></div>`;
            return true;
        } else {
            localStorage.removeItem('tiltas_lejarat');
            document.querySelector('.chat-input-area').style.display = "flex";
        }
    }
    return false;
}

function botValaszol(u) {
    if (ellenorizTiltast()) return;
    
    // Az üzenet feldolgozása: kisbetű + ékezetek eltávolítása
    const msg = ekezetmentesites(u);

    // 1. Káromkodás szűrés (ékezet nélkül is fogja!)
    if (csunyaSzavak.some(s => ekezetmentesites(msg).includes(ekezetmentesites(s)))) {
        localStorage.setItem('tiltas_lejarat', Date.now() + BAN_TIME);
        ellenorizTiltast();
        return;
    }

    let valasz = "";

    // 2. OKOSABB VÁLASZ LOGIKA (Ékezetmentes kulcsszavakkal)
    if (msg.includes("mennyi") || msg.includes("arfolyam") || msg.includes("kapok") || msg.includes("arany")) {
        valasz = "Az árfolyam fix: FC -> RC esetén 2x szorzó (5% adó), RC -> FC esetén 0.5x szorzó (10% adó). A kalkulátor már a levont összeget mutatta!";
    }
    else if (msg.includes("mikor") || msg.includes("hol van") || msg.includes("ido") || msg.includes("varni") || msg.includes("lassu") || msg.includes("soka")) {
        valasz = "Az adminisztrátorok értesítve lettek! Általában 5-10 perc, amíg be tudnak lépni. Kérlek, várj türelemmel!";
    }
    else if (msg.includes("szia") || msg.includes("hello") || msg.includes("udv") || msg.includes("hali")) {
        valasz = "Szia! Én a segéd-bot vagyok. Az ajánlatodat rögzítettem, az adminok hamarosan érkeznek.";
    }
    else if (msg.includes("ado") || msg.includes("levon") || msg.includes("szazalek") || msg.includes("jutalek")) {
        valasz = "Az adót (5% vagy 10%) a rendszer már levonta. Amit a chaten látsz összeget, az már a nettó, amit megkapsz.";
    }
    else if (msg.includes("biztos") || msg.includes("atver") || msg.includes("megbizhato") || msg.includes("scam")) {
        valasz = "Nálunk nincs átverés! Minden üzlet naplózva van Discordon, és csak hivatalos adminok intézik.";
    }
    else if (msg.includes("koszi") || msg.includes("koszonom") || msg.includes("rendben") || msg.includes("oke") || msg.includes("ertem")) {
        valasz = "Nagyon szívesen! Maradj az oldalon, hamarosan jelentkezünk.";
    }
    else {
        valasz = "Értettem! Az üzenetedet továbbítottam az adminoknak. Kérlek várd meg a válaszukat!";
    }

    setTimeout(() => { 
        if(!ellenorizTiltast()) kiirAdmin("Bot", valasz); 
    }, 1200);
}

function inditas() {
    if (ellenorizTiltast()) return;
    const nev = document.getElementById('pName').value.trim();
    const osszeg = parseFloat(document.getElementById('pAmount').value);
    const irany = document.getElementById('pDirection').value;

    if (!nev || isNaN(osszeg) || osszeg < MIN_LIMIT) {
        document.getElementById('error-msg').innerText = `Hiba! Minimum limit: ${MIN_LIMIT}`;
        return;
    }

    let szorzo = (irany === 'fc-to-rc') ? 2 : 0.5;
    let adoKulcs = (irany === 'fc-to-rc') ? 0.05 : 0.10;
    let netto = (osszeg * szorzo) * (1 - adoKulcs);
    let kapottTipus = (irany === 'fc-to-rc') ? "RC" : "FC";
    let leadottTipus = (irany === 'fc-to-rc') ? "FC" : "RC";

    document.getElementById('calc-panel').classList.add('hidden');
    document.getElementById('chat-panel').classList.remove('hidden');
    
    kiirUser(nev, `Szeretnék váltani: ${osszeg} ${leadottTipus}.`);
    setTimeout(() => {
        kiirAdmin("Bot", `Rögzítettem! Adó levonása után: **${netto} ${kapottTipus}** jár neked. Értesítettem az adminokat!`);
    }, 800);

    if (DISCORD_WEBHOOK !== "IDE_MASOLD_A_LINKET") {
        fetch(DISCORD_WEBHOOK, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                content: `🚀 **VÁLTÁS**\n👤 Név: ${nev}\n📥 Lead: ${osszeg} ${leadottTipus}\n📤 Jár: ${netto} ${kapottTipus}` 
            })
        });
    }
}

function kuld() {
    if (ellenorizTiltast()) return;
    const inp = document.getElementById('msgInput');
    if (!inp.value.trim()) return;
    kiirUser(document.getElementById('pName').value || "Vevő", inp.value);
    botValaszol(inp.value);
    inp.value = "";
}

function kiirUser(n, sz) {
    const l = document.getElementById('chat-logs');
    l.innerHTML += `<div class="msg-wrapper user-wrapper"><div class="msg user"><b>${n}</b>${sz}</div></div>`;
    l.scrollTop = l.scrollHeight;
}

function kiirAdmin(n, sz) {
    const l = document.getElementById('chat-logs');
    l.innerHTML += `<div class="msg-wrapper admin-wrapper"><div class="msg admin"><b>${n}</b>${sz}</div></div>`;
    l.scrollTop = l.scrollHeight;
}

function vissza() {
    if (ellenorizTiltast()) return;
    document.getElementById('chat-panel').classList.add('hidden');
    document.getElementById('calc-panel').classList.remove('hidden');
}