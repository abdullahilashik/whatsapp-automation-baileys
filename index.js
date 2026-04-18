const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys')

const pino = require('pino')
const qrcode = require('qrcode-terminal')

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth')

  // 🔥 IMPORTANT: fetch correct WA version
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'debug' }),
    browser: ['Windows', 'Chrome', '120.0.0'],
    markOnlineOnConnect: false
  })

    // QR code login
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('Scan this QR:');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

            console.log('Connection closed. Error:', lastDisconnect?.error, 'Reconnecting:', shouldReconnect);

            if (shouldReconnect) {
                setTimeout(() => startBot(), 3000);
            } else {
                console.log('Connection logged out. Not reconnecting.');
            }
        } else if (connection === 'open') {
            console.log('✅ Connected!');
        } else if (connection) {
            console.log('Connection status:', connection);
        }
    });

    // Save session
    sock.ev.on('creds.update', saveCreds)

    // Listen for messages
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0]

        if (!msg.message || msg.key.fromMe) return

        const sender = msg.key.remoteJid
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ''

        console.log('📩 Message from', sender, ':', text)

        // Simple reply
        if (text.toLowerCase() === 'hi') {
            await sock.sendMessage(sender, { text: 'Hello! 👋' })
        } else {
            // if not found in our database send a default reply
            await sock.sendMessage(sender, {text: 'We could not find the information you are looking for. Just send Hi / hi.'});
        }
    })
}

startBot().catch(console.error)