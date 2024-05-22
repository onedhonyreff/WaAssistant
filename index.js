const { Client } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const client = new Client({
    puppeteer: {
        headless: true,
        args: ["--no-sandbox", "--disable-gpu"],
    },
    webVersionCache: {
        type: "remote",
        remotePath:
            "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
    },
});

client.on("qr", (qr) => {
    // Generate and scan this code with your phone
    console.log("QR RECEIVED", qr);
    if (qr) qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
    console.log("Client is ready!");
});

client.on("message", (msg) => {
    console.log("pesan masuk");
    console.log(msg);
    msg.getChat().then((chat) => {
        chat.sendStateTyping();
    });
    if (msg.body == "!ping") {
        msg.reply("pong");
    }
});

client.initialize();
