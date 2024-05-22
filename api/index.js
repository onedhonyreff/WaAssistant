import { Client } from "whatsapp-web.js";
import express from "express";
import bodyParser from "body-parser";
// import qrcode from "qrcode-terminal";
import chromium from "chrome-aws-lambda";

let currentQrText = "QR not available";

const launchWhatsAppClient = async () => {
    const browser = await chromium.puppeteer.launch({
        args: [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: true,
        ignoreHTTPSErrors: true,
    });

    const client = new Client({
        // puppeteer: {
        //     headless: true,
        //     args: ["--no-sandbox", "--disable-gpu"],
        // },
        puppeteer: { browserWSEndpoint: await browser.wsEndpoint() },
        webVersionCache: {
            type: "remote",
            remotePath:
                "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
        },
    });

    client.on("qr", (qr) => {
        console.log("QR RECEIVED", qr);
        if (qr) {
            // qrcode.generate(qr, { small: true });
            currentQrText = qr;
        }
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

    client.on("disconnected", (event) => {
        if (event === "NAVIGATION") {
            client.initialize();
        }
    });

    client.initialize();
};

launchWhatsAppClient();

function handleDefault(req, res) {
    res.status(200).json({
        qrText: currentQrText,
    });
}

const port = "8300";

const app = express();
app.use(bodyParser.json());

app.get("/", handleDefault);

app.use((req, res) =>
    res.status(404).send({
        status: false,
        error: {
            message: `The requested endpoint (${req.method.toLocaleUpperCase()} ${
                req.path
            }) was not found. please make sure to use "http://localhost:${port}/v1" as the base URL.`,
            type: "invalid_request_error",
        },
    })
);

app.listen(Number(port), "0.0.0.0", async () => {
    console.log(`💡 Server is running at http://localhost:${port}`);
    console.log();
    console.log(`🔗 Local Base URL: http://localhost:${port}/v1`);
});
