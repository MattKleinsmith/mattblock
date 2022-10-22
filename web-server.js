const https = require("https");
const fs = require('fs');
const path = require('node:path');

const host = '0.0.0.0';
const { webServerPort, shouldRedirectHttp, httpsKeyPath, httpsCertificatePath } = require('./config.js');

const extensionToType = {
    "html": "text/html",
    "css": "text/css",
    "js": "text/javascript",
    "ico": "image/x-icon",
    "png": "image/png"
}

function sendFile(response, file) {
    const filename = path.join(__dirname, "/client", file);
    fs.promises.readFile(filename).then(data => {
        const ext = file.split('.')[1];  // SECURITY: Prevents the use of "../"
        response.setHeader("Content-Type", extensionToType[ext]);
        response.end(data);
    }).catch(err => {
        console.log(err);
        response.statusCode = 404;
        response.end();
    });
}

const options = {
    key: fs.readFileSync(httpsKeyPath),
    cert: fs.readFileSync(httpsCertificatePath)
};

const server = https.createServer(options, (request, response) => {
    const path = request.url === "/" ? "index.html" : request.url;
    sendFile(response, path);
});

server.listen(webServerPort, host, () => {
    console.log(`Server is running on https://${host}:${webServerPort}`);
});

//////// HTTP --> HTTPS redirect

if (shouldRedirectHttp) {
    const http = require("http");
    const httpPort = 8000;
    const httpServer = http.createServer(function (request, response) {
        response.writeHead(301, { Location: `https://${request.headers.host}${request.url}` });
        response.end();
    });
    httpServer.listen(httpPort);
}
