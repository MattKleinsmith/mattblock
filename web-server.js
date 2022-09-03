const http = require("http");
const fs = require('fs').promises;
const path = require('node:path');

const host = '0.0.0.0';
const port = 8000;

function sendFile(res, file) {
    const filename = path.join(__dirname, "/client", file);
    fs.readFile(filename).then(data => {
        res.end(data);
    }).catch(err => {
        console.log(err);
        res.statusCode = 404;
        res.end();
    });
}

const server = http.createServer((req, res) => {
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
    console.log(`Server is running on http://${host}:${port}`);
});
