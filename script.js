const DISCORD_WEBHOOK = "IDE_MASOLD_A_LINKET";
const MIN_LIMIT = 1000;
const BAN_TIME = 300000; // 5 perc
const csunyaSzavak = ["kurva", "geci", "fasz", "bazmeg", "buzi", "anyád"];

window.onload = function() {
    ellenorizTiltast();
    
    // Billentyűzet figyelés (Enter)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const chatPanelVisible = !document.getElementById('chat-panel').classList.contains('hidden');
            if (chatPanelVisible) kuld();
            else inditas();
        }
    });

    // Időzítő a némítás lejártának figyeléséhez
    setInterval(ellenorizTiltast, 2000); 
};

// Segédfunkció: Ékezetek eltávolítása és kisbetűsítés
function normalizal(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function ellenorizTiltast() {
    const tiltasVege = localStorage.getItem('tiltas_lejarat');
    if (tiltasVege) {
        const most = Date.now();
        const hatralevo = tiltasVege - most;

        if (hatralevo > 0) {
            const p = Math.floor(hatralevo / 60000);
            const m = Math.floor((hatralevo % 60000) / 1000);
            
            // Panel kezelés tiltás alatt
            document.getElementById('calc-panel').classList.add('hidden');
            document.getElementById('chat-panel').classList.remove('hidden');
            document.querySelector('.chat-input-area').style.display = "none";
            
            document.getElementById('chat-logs').innerHTML = `
                <div class="msg-wrapper admin-wrapper">
                    <div class="msg admin">
                        <b>Rendszer</b>
                        ⚠️ Némítva vagy káromkodás miatt!<br>
                        Visszakapcsolás: <b>${p}p ${m}mp</b> múlva.
                    </div>
                </div>`;
            return true;
        } else {
            localStorage.removeItem('tiltas_lejarat');
            location.reload(); // Frissítünk, hogy minden gomb visszajöjjön
        }
    }
    return false;
}

function botValaszol(nyersUzenet) {
    if (ellenorizTiltast()) return;
    
    const msg = normalizal(nyersUzenet);

    // 1. Káromkodás csekkolás
    if (csunyaSzavak.some(s => normalizal(msg).includes(normalizal(s)))) {
        localStorage.setItem('tiltas_lejarat', Date.now() + BAN_TIME);
        ellenorizTiltast();
        return;
    }

    let valasz = "";

    // 2. PRIORITÁS ALAPÚ VÁLASZOK (A Bot "agya")
    
    // IDŐ ÉS VÁRAKOZÁS (Ez az első, mert ez a leggyakoribb kérdés)
    if (msg.includes("mikor") || msg.includes("ido") || msg.includes("varni") || msg.includes("soka") || msg.includes("lassu")) {
        valasz = "Az adminisztrátorok éppen kaptak egy értesítést a Discord szerverünkön a váltási szándékodról. Általában 5 és 10 perc közötti időt vesz igénybe, amíg egy illetékes kolléga fel tud lépni és lebonyolítja az üzletet. Kérlek, légy türelemmel, ne zárd be az ablakot!";
    }
    // ONLINE FIZETÉS
    else if (msg.includes("online") || msg.includes("szerver nelkul") || msg.includes("fellepes nelkul") || msg.includes("nem tudok fellepni")) {
        valasz = "Igen, természetesen van lehetőség online kifizetésre is! Ebben az esetben nem kell feljönnöd a szerverre. Ha bepipáltad az opciót, az adminisztrátorunk a háttérben (az adatbázisunkon keresztül) vonja le a váltandó összeget és írja jóvá neked a váltást.";
    }
    // ÁRFOLYAM ÉS SZÁMÍTÁS
    else if (msg.includes("mennyi") || msg.includes("arfolyam") || msg.includes("kapok") || msg.includes("szamold") || msg.includes("arany")) {
        valasz = "A váltási árfolyam nálunk rögzített. FC-ből RC-be 2x-es szorzóval váltunk (5% adó mellett), míg RC-ből FC-be 0.5x-ös szorzóval (10% adó mellett). A rendszerünk már elvégezte a matematikai számítást, így amit a chaten látsz összeget, azt fogod kézhez kapni.";
    }
    // ADÓK ÉS LEVONÁSOK
    else if (msg.includes("ado") || msg.includes("levon") || msg.includes("szazalek") || msg.includes("jutalek")) {
        valasz = "Az adók a szerver fenntartását szolgálják. Jelenleg FC váltásnál 5%, RC váltásnál pedig 10% a levonás mértéke. Fontos: ezt a botunk már levonta az általad beírt összegből, tehát a 'Jár neked' rész már a nettó értéket mutatja.";
    }
    // KÖSZÖNÉS ÉS ÜDVÖZLÉS
    else if (msg.includes("szia") || msg.includes("hello") || msg.includes("udv") || msg.includes("hali") || msg.includes("jo napot")) {
        valasz = "Üdvözöllek! Én a Kereskedelmi Segéd Bot vagyok. Rögzítettem a nevedet és a váltási igényedet. Az adminok hamarosan csatlakoznak a beszélgetéshez. Van esetleg valamilyen technikai kérdésed addig?";
    }
    // KÖSZÖNET ÉS ELUTASÍTÁS
    else if (msg.includes("koszi") || msg.includes("koszonom") || msg.includes("rendben") || msg.includes("oke") || msg.includes("ertem")) {
        valasz = "Nagyon szívesen! Itt leszek a háttérben, ha bármi másra kíváncsi lennél. Kérlek várd meg az admint!";
    }
    // HA NEM ÉRTI
    else {
        valasz = "Értettem az üzenetedet! Sajnos erre a kérdésre nem tudok pontos választ adni, de továbbítottam az adminoknak. Kérlek várd meg, amíg egy élő személy válaszol neked itt a felületen.";
    }

    // Válasz késleltetése (emberi hatás)
    setTimeout(() => { 
        if(!ellenorizTiltast()) kiirAdmin("Bot", valasz); 
    }, 1500);
}

function inditas() {
    if (ellenorizTiltast()) return;
    const nev = document.getElementById('pName').value.trim();
    const osszeg = parseFloat(document.getElementById('pAmount').value);
    const irany = document.getElementById('pDirection').value;
    const isOnline = document.getElementById('onlinePay').checked;

    if (!nev || isNaN(osszeg) || osszeg < MIN_LIMIT) {
        document.getElementById('error-msg').innerText = `Hiba! Minimum váltás: ${MIN_LIMIT}`;
        return;
    }

    let szorzo = (irany === 'fc-to-rc') ? 2 : 0.5;
    let adoKulcs = (irany === 'fc-to-rc') ? 0.05 : 0.10;
    let brutto = osszeg * szorzo;
    let netto = brutto - (brutto * adoKulcs);
    let kapottTipus = (irany === 'fc-to-rc') ? "RC" : "FC";
    let leadottTipus = (irany === 'fc-to-rc') ? "FC" : "RC";

    document.getElementById('calc-panel').classList.add('hidden');
    document.getElementById('chat-panel').classList.remove('hidden');
    
    kiirUser(nev, `Szeretnék váltani: **${osszeg} ${leadottTipus}**-t. ${isOnline ? '(Online kifizetést kérek!)' : ''}`);
    
    setTimeout(() => {
        kiirAdmin("Bot", `Rögzítettem az ajánlatodat! Adó levonása után összesen **${netto} ${kapottTipus}** jár neked. Az adminisztrátorok értesítve lettek!`);
    }, 1000);

    // Discord Webhook
    if (DISCORD_WEBHOOK !== "IDE_MASOLD_A_LINKET") {
        const method = isOnline ? "🌐 ONLINE" : "🎮 SZERVEREN";
        const command = `/money take ${nev} ${osszeg}`;
        fetch(DISCORD_WEBHOOK, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                content: `🚨 **ÚJ VÁLTÁSI IGÉNY**\n👤 Játékos: \`${nev}\`\n📥 Lead: ${osszeg} ${leadottTipus}\n📤 Kap: ${netto} ${kapottTipus}\n📍 Mód: ${method}\n💻 Konzol: \`${command}\`` 
            })
        });
    }
}

function kuld() {
    if (ellenorizTiltast()) return;
    const inp = document.getElementById('msgInput');
    const txt = inp.value.trim();
    if (!txt) return;
    kiirUser(document.getElementById('pName').value || "Vevő", txt);
    botValaszol(txt);
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