import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const binDir = path.join(__dirname, 'bin');
const linuxPath = path.join(binDir, 'yt-dlp');

if (process.platform !== 'win32') {
    if (!fs.existsSync(linuxPath)) {
        console.log('>> Downloading yt-dlp for Linux (Render.com)...');
        if (!fs.existsSync(binDir)) fs.mkdirSync(binDir, { recursive: true });
        
        await new Promise((resolve, reject) => {
            const file = fs.createWriteStream(linuxPath);
            const download = (url) => {
                https.get(url, (res) => {
                    if (res.statusCode === 301 || res.statusCode === 302) {
                        download(res.headers.location);
                    } else {
                        res.pipe(file);
                        file.on('finish', () => {
                            file.close();
                            try {
                                fs.chmodSync(linuxPath, 0o755);
                                console.log('>> yt-dlp setup complete! Executable permission granted.');
                                resolve();
                            } catch (e) {
                                console.error('Failed to set permissions:', e);
                                resolve(); // continue anyway
                            }
                        });
                    }
                }).on('error', (err) => {
                    console.error('Download error:', err);
                    fs.unlinkSync(linuxPath);
                    resolve();
                });
            };
            download('https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp');
        });
    } else {
        console.log('>> yt-dlp for Linux already exists.');
        try { fs.chmodSync(linuxPath, 0o755); } catch(e) {}
    }
} else {
    console.log('>> Running on Windows, using existing yt-dlp.exe');
}
