const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
    // Decodificar URI para soportar espacios y caracteres especiales
    let safePath = decodeURI(req.url.split('?')[0]);
    if (safePath === '/') {
        safePath = '/index.html';
    }

    const filePath = path.join(ROOT_DIR, safePath);

    // Evitar salir de la raíz del proyecto (seguridad básica)
    if (!filePath.startsWith(ROOT_DIR)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('403 Prohibido');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
                <body style="font-family: sans-serif; background: #050505; color: #fff; padding: 2rem;">
                    <h2>404 - Archivo no encontrado</h2>
                    <p>La ruta <code>${safePath}</code> no existe.</p>
                    <p><a href="/" style="color: #6B00FF;">Volver a Inicio</a></p>
                </body>
            `);
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache',
            'Access-Control-Allow-Origin': '*'
        });

        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    });
});

server.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`🚀 SERVIDOR LOCAL DISK CREATIVO ACTIVO`);
    console.log(`========================================`);
    console.log(`  Inicio (Estable):       http://localhost:${PORT}/`);
    console.log(`  Compilador OS (DEX):    http://localhost:${PORT}/dex.html`);
    console.log(`  Validación (Experimento): http://localhost:${PORT}/experimento.html`);
    console.log(`  Laboratorio (Exper):    http://localhost:${PORT}/exper.html`);
    console.log(`========================================\n`);
});
