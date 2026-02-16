const DISCORD_WEBHOOK = "IDE_MASOLD_A_LINKET";
const MIN_LIMIT = 1000;
const BAN_TIME = 300000; // 5 perc

// KIBŐVÍTETT TILTÓLISTA (A leggyakoribb és legdurvább kifejezések)
const csunyaSzavak = [
    "kurva", "geci", "fasz", "bazmeg", "buzi", "anyad", "szop", "picsa", "kocsog", "idiota",
    "nyomorult", "balfasz", "homo", "csicska", "gane", "f@sz", "b@zmeg", "k.urva", "kurv@",
    "szopjal", "faszfej", "gecilada", "kurvafi", "anyadat", "fasszop", "f@sszop", "nyomorek",
    "fogyatekos", "gecis", "geciz", "basz", "baszki", "baszdmeg", "faszom", "gecim", "kurvane",
    "cigany", "nigga", "nigger", "zsidozas", "naci", "hitler", "kurvanyad", "anyadert", "kurvulsz",
    "dogolj meg", "rohadj meg", "meleg"
];

window.onload = function() {
    ellenorizTiltast();
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const chatLathato = !document.getElementById('chat-panel').classList.contains('hidden');
            if (chatLathato) kuld();
            else inditas();
        }
    });
    setInterval(ellenorizTiltast, 5000); 
};

function valasztIdo(elem) {
    document.querySelectorAll('.time-slot').forEach(slot => slot.classList.remove('selected'));
    elem.classList.add('selected');
    document.getElementById('selectedTime').value = elem.innerText;
}

function normalizal(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function ellenorizTiltast() {
    const tiltasVege = localStorage.getItem('tiltas_lejarat');
    if (tiltasVege) {
        const hatralevo = tiltasVege - Date.now();
        if (hatralevo > 0) {
            const p = Math.floor(hatralevo / 60000);
            const m = Math.floor((hatralevo % 60000) / 1000);
            document.getElementById('calc-panel').classList.add('hidden');
            document.getElementById('chat-panel').classList.remove('hidden');
            document.querySelector('.chat-input-area').style.display = "none";
            document.getElementById('chat-logs').innerHTML = `<div class="msg-wrapper admin-wrapper"><div class="msg admin"><b>Rendszer</b>⚠️ Némítva vagy káromkodás miatt!<br>Még hátra van: <b>${p}p ${m}mp</b></div></div>`;
            return true;
        } else {
            localStorage.removeItem('tiltas_lejarat');
            location.reload();
        }
    }
    return false;
}

function botValaszol(u) {
    if (ellenorizTiltast()) return;
    const msg = normalizal(u);
    const szokoztelenMsg = msg.replace(/\s+/g, ''); // Kiszűri a szóközöket a trükközők ellen

    // OKOS KÁROMKODÁS ELLENŐRZÉS
    const vanBenneCsunya = csunyaSzavak.some(szo => {
        const tisztaSzo = normalizal(szo);
        return msg.includes(tisztaSzo) || szokoztelenMsg.includes(tisztaSzo);
    });

    if (vanBenneCsunya) {
        const nev = document.getElementById('pName').value || "Ismeretlen";
        localStorage.setItem('tiltas_lejarat', Date.now() + BAN_TIME);
        
        // RIASZTÁS KÜLDÉSE DISCORDRA
        if (DISCORD_WEBHOOK !== "IDE_MASOLD_A_LINKET") {
            fetch(DISCORD_WEBHOOK, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ 
                    content: `⚠️ **NÉMÍTÁS TÖRTÉNT**\n👤 Felhasználó: \`${nev}\`\n🚫 Üzenet: ||${u}||\n⏰ Időtartam: 5 perc` 
                })
            });
        }
        
        ellenorizTiltast();
        return;
    }

    let valasz = "";
    if (msg.includes("mikor") || msg.includes("ido") || msg.includes("varni") || msg.includes("soka")) {
        valasz = "Az adminok értesítést kaptak! Általában 5-10 perc az átfutás, de figyelembe vesszük az általad választott időpontot is.";
    } else if (msg.includes("mennyi") || msg.includes("arfolyam") || msg.includes("kapok")) {
        valasz = "Az árfolyam fix. A kalkulátor már levonta az adót (5% vagy 10%), a tiszta összeget látod a chaten.";
    } else if (msg.includes("szia") || msg.includes("hello") || msg.includes("udv")) {
        valasz = "Szia! Én a kereskedelmi segéd vagyok. Az ajánlatodat rögzítettem, az admin hamarosan jön.";
    } else if (msg.includes("koszi") || msg.includes("rendben") || msg.includes("oke")) {
        valasz = "Nagyon szívesen! Találkozunk a szerveren az általad kért időpontban.";
    } else {
        valasz = "Értettem! Az üzenetedet rögzítettem az adminisztrátoroknak. Kérlek várd meg őket.";
    }

    setTimeout(() => { if(!ellenorizTiltast()) kiirAdmin("Bot", valasz); }, 1200);
}

function inditas() {
    if (ellenorizTiltast()) return;
    const nev = document.getElementById('pName').value.trim();
    const osszeg = parseFloat(document.getElementById('pAmount').value);
    const irany = document.getElementById('pDirection').value;
    const mikor = document.getElementById('selectedTime').value;

    if (!nev || isNaN(osszeg) || osszeg < MIN_LIMIT || !mikor) {
        document.getElementById('error-msg').innerText = `Hiba! Tölts ki mindent és válassz időpontot!`;
        return;
    }

    let szorzo = (irany === 'fc-to-rc') ? 2 : 0.5;
    let ado = (irany === 'fc-to-rc') ? 0.05 : 0.10;
    let netto = (osszeg * szorzo) * (1 - ado);
    let kapottTipus = (irany === 'fc-to-rc') ? "RC" : "FC";
    let leadottTipus = (irany === 'fc-to-rc') ? "FC" : "RC";

    document.getElementById('calc-panel').classList.add('hidden');
    document.getElementById('chat-panel').classList.remove('hidden');
    
    kiirUser(nev, `Szeretnék váltani: **${osszeg} ${leadottTipus}**-t. Időpont: ${mikor}`);
    
    setTimeout(() => {
        kiirAdmin("Bot", `Az ajánlatodat elmentettem! Adó levonása után összesen **${netto} ${kapottTipus}** jár neked. Kérlek, légy elérhető ekkor: ${mikor}.`);
    }, 1000);

    if (DISCORD_WEBHOOK !== "IDE_MASOLD_A_LINKET") {
        fetch(DISCORD_WEBHOOK, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                content: `🚀 **VÁLTÁSI IGÉNY ÉRKEZETT**\n👤 Név: \`${nev}\`\n📥 Lead: **${osszeg} ${leadottTipus}**\n📤 Kap: **${netto} ${kapottTipus}**\n⏰ Időpont: \`${mikor}\`\n\n⚠️ *Lépj fel a szerverre, és intézd el vele személyesen!*` 
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
    l.innerHTML += `<div class="msg-wrapper admin-wrapper"><div class="msg admin"><b>Bot</b>${sz}</div></div>`;
    l.scrollTop = l.scrollHeight;
}

function vissza() {
    if (ellenorizTiltast()) return;
    document.getElementById('chat-panel').classList.add('hidden');
    document.getElementById('calc-panel').classList.remove('hidden');
}