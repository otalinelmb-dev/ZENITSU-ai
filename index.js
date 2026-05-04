const { default: makeWASocket, useMultiFileAuthState, delay } = require("@whiskeysockets/baileys");
const pino = require("pino");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// CONFIGURATION OFFICIELLE - ZENITSU_46
const API_KEY = "AIzaSyB7SAL1Txzfbv1CGBhZoI5Fi8Qk8MV6wkQ";
const MY_NUMBER = "243819480245"; 

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: "silent" })
    });

    // SYSTÈME DE CODE DE JUMELAGE AUTOMATIQUE
    if (!sock.authState.creds.registered) {
        console.log("-----------------------------------------");
        console.log(`GÉNÉRATION DU CODE POUR : ${MY_NUMBER}`);
        await delay(5000); 
        const code = await sock.requestPairingCode(MY_NUMBER);
        console.log(`\nTON CODE DE JUMELAGE : ${code}\n`);
        console.log("INSTRUCTIONS :");
        console.log("1. Ouvre WhatsApp sur ton téléphone.");
        console.log("2. Paramètres > Appareils connectés.");
        console.log("3. Connecter un appareil > Connecter avec le numéro.");
        console.log(`4. Tape ce code : ${code}`);
        console.log("-----------------------------------------");
    }

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const remoteJid = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

        // RÉACTION AU NOM : ZENITSU OU ZENITSU_46
        const input = text.toLowerCase();
        if (input.startsWith("zenitsu")) {
            const query = text.replace(/zenitsu_46|zenitsu/gi, "").trim();
            
            try {
                const prompt = `Tu es ZENITSU_46, une IA experte en culture Otaku créée par Jeffrey LMB. 
                Tu as la personnalité de Zenitsu de Demon Slayer (nerveux mais puissant). 
                Réponds avec passion et des emojis ⚡️. 
                Question : ${query}`;

                const result = await model.generateContent(prompt);
                const response = result.response.text();
                
                await sock.sendMessage(remoteJid, { text: response });
            } catch (error) {
                await sock.sendMessage(remoteJid, { text: "AAAAHH ! Le système a foudroyé mon cerveau ! 😱⚡️" });
            }
        }
    });

    sock.ev.on("connection.update", (update) => {
        const { connection } = update;
        if (connection === "open") console.log("ZENITSU_46 EST PRÊT ! ⚡️✅");
        if (connection === "close") startBot();
    });
}

console.log("Lancement de ZENITSU_46 par Jeffrey LMB...");
startBot();
