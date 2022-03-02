
import express from 'express';
import http from 'http';
import path from 'path';

export function startExpress() {
    /* start server functions */
    const __dirname = path.resolve();

    const app = express();
    const port = process.env.PORT || 3000;

    const server = http.createServer(app);

    app.use(express.static(path.join(__dirname, 'src/public')));

    // sendFile when users go here
    app.get('/fileTest', function (req, res) {
        res.sendFile(path.join(__dirname, 'src/public/index.html'));
    });

    server.listen(port);
    console.log('Server started at http://localhost:' + port);
}