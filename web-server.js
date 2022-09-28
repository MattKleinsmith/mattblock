const https = require("https");
const fs = require('fs');
const path = require('node:path');

const host = '0.0.0.0';
const { webServerPort, shouldRedirectHttp, httpsKeyPath, httpsCertificatePath } = require('./config.js');

const extensionToType = {
    "html": "text/html",
    "css": "text/css",
    "js": "text/javascript",
    "ico": "image/x-icon"
}

function sendFile(res, file) {
    const filename = path.join(__dirname, "/client", file);
    fs.promises.readFile(filename).then(data => {
        const ext = file.split('.')[1];
        res.setHeader("Content-Type", extensionToType[ext]);
        res.end(data);
    }).catch(err => {
        console.log(err);
        res.statusCode = 404;
        res.end();
    });
}

const options = {
    key: fs.readFileSync(httpsKeyPath),
    cert: fs.readFileSync(httpsCertificatePath)
};

const server = https.createServer(options, (req, res) => {
    const path = req.url === "/" ? "index.html" : req.url;
    sendFile(res, path);
});

server.listen(webServerPort, host, () => {
    console.log(`Server is running on https://${host}:${webServerPort}`);
});

//////// HTTP --> HTTPS redirect

if (shouldRedirectHttp) {
    const http = require("http");
    const httpPort = 8000;
    const httpServer = http.createServer(function (req, res) {
        res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
        res.end();
    });
    httpServer.listen(httpPort);
}
