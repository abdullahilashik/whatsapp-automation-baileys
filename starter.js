
const QRCode = require('qrcode');
const {makeWASocket} = require('baileys');
const pino = require('pino')

// const { state, saveCreds } = await useMultiFileAuthState('auth')

const sock = makeWASocket({
  auth: 'auth', // auth state of your choosing,
  logger: pino() // you can configure this as much as you want, even including streaming the logs to a ReadableStream for upload or saving to a file
})

sock.env.on('connection.update', async(update) => {
    const {connection, lastDisconnect, qr} = update;

    if(qr){
        console.log(await QRCode.toString(qr, {type: 'terminal'}));
    }
});