const https = require("https");
const fs = require('fs');
const path = require('node:path');

const host = '0.0.0.0';
const port = 8001;

function sendFile(res, file) {
    const filename = path.join(__dirname, "/client", file);
    fs.promises.readFile(filename).then(data => {
        res.end(data);
    }).catch(err => {
        console.log(err);
        res.statusCode = 404;
        res.end();
    });
}

const options = {
    key: fs.readFileSync('./client/.well-known/privkey.pem'),
    cert: fs.readFileSync('./client/.well-known/fullchain.pem')
};

const server = https.createServer(options, (req, res) => {
    switch (req.url) {
        case "/":
            sendFile(res, "index.html");
            break;
        case "/css/main.css":
            sendFile(res, "css/main.css");
            break;
        case "/js/ip.js":
            sendFile(res, "js/ip.js");
            break;
        case "/js/auth.js":
            sendFile(res, "js/auth.js");
            break;
        case "/js/configuration.js":
            sendFile(res, "js/configuration.js");
            break;
        case "/js/platform.js":
            sendFile(res, "js/platform.js");
            break;
        case "/js/gameData.js":
            sendFile(res, "js/gameData.js");
            break;
        case "/js/gameLoop.js":
            sendFile(res, "js/gameLoop.js");
            break;
        default:
            res.statusCode = 404;
            res.end();
            break;
    }
});

server.listen(port, host, () => {
    console.log(`Server is running on https://${host}:${port}`);
});


//////// HTTP --> HTTPS redirect

const http = require("http");
const httpPort = 8000;
const httpServer = http.createServer(function (req, res) {
    res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
    res.end();
});
httpServer.listen(httpPort);
