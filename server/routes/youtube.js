import { Router } from 'express';
import { execFile } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, unlinkSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';

const router = Router();
const __dirname = dirname(fileURLToPath(import.meta.url));

const YTDLP_BIN = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
const YT_DLP_PATH = join(__dirname, '..', 'bin', YTDLP_BIN);

// Node.jsの実行パスからディレクトリを取得（yt-dlpのJSランタイム用）
const NODE_DIR = dirname(process.execPath);
const EXEC_ENV = {
    ...process.env,
    PATH: `${NODE_DIR}${process.platform === 'win32' ? ';' : ':'}${process.env.PATH || ''}`,
};

/**
 * yt-dlpコマンドを実行するヘルパー
 * Node.jsをPATHに含めて、yt-dlpがJSランタイムを利用できるようにする
 */
function runYtDlp(args, timeout = 60000) {
    return new Promise((resolve, reject) => {
        execFile(YT_DLP_PATH, args, { maxBuffer: 10 * 1024 * 1024, env: EXEC_ENV, timeout }, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(stderr || error.message));
            } else {
                resolve(stdout.trim());
            }
        });
    });
}

/**
 * フォールバック付きでyt-dlpを実行
 * 1. Cookieなしで試行
 * 2. 失敗した場合、各ブラウザのCookieで再試行
 */
async function runYtDlpWithFallback(args, timeout = 60000) {
    // まずCookieなしで試行
    try {
        return await runYtDlp(args, timeout);
    } catch (firstError) {
        console.log('⚠️ Cookie無しで失敗。ブラウザCookieでフォールバック試行...');

        // 各ブラウザを順番に試行
        const browsers = ['chrome', 'edge', 'firefox', 'brave'];
        for (const browser of browsers) {
            try {
                console.log(`  → ${browser} Cookieで試行中...`);
                return await runYtDlp(['--cookies-from-browser', browser, ...args], timeout);
            } catch (e) {
                console.log(`  ✗ ${browser}: 失敗`);
            }
        }

        // すべて失敗した場合、元のエラーを改善して返す
        const errorMsg = firstError.message || '';
        if (errorMsg.includes('not available') || errorMsg.includes('Sign in')) {
            throw new Error(
                'この動画にアクセスできませんでした。YouTubeのボット対策により制限されている可能性があります。\n' +
                '対処法: すべてのブラウザを閉じてからもう一度お試しください（Cookie読み取りにはブラウザを閉じる必要があります）。'
            );
        }
        throw firstError;
    }
}

/**
 * POST /api/youtube/info
 * YouTube URLから動画情報のみを取得
 */
router.post('/info', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ message: 'YouTube URLが指定されていません。' });
        }

        const output = await runYtDlpWithFallback([
            '--dump-json',
            '--no-download',
            '--no-warnings',
            url,
        ]);

        const info = JSON.parse(output);
        res.json({
            title: info.title,
            duration: info.duration,
            thumbnail: info.thumbnail,
            author: info.uploader || info.channel,
        });
    } catch (error) {
        console.error('YouTube info error:', error);
        res.status(500).json({
            message: `動画情報の取得に失敗しました: ${error.message}`,
        });
    }
});

/**
 * POST /api/youtube/download
 * YouTube URLから動画をダウンロードしてクライアントに返す
 */
router.post('/download', async (req, res) => {
    const tempFile = join(tmpdir(), `swinglens_${randomUUID()}.mp4`);

    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ message: 'YouTube URLが指定されていません。' });
        }

        // まず動画情報を取得して長さチェック
        let info;
        try {
            const output = await runYtDlpWithFallback([
                '--dump-json',
                '--no-download',
                '--no-warnings',
                url,
            ]);
            info = JSON.parse(output);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        // 5分制限
        if (info.duration > 300) {
            return res.status(400).json({
                message: `動画が長すぎます（${Math.floor(info.duration / 60)}分${info.duration % 60}秒）。5分以内の動画を指定してください。`,
            });
        }

        console.log(`📥 Downloading: "${info.title}" (${info.duration}s)`);

        // yt-dlpで動画をダウンロード（低画質mp4）
        await runYtDlpWithFallback([
            '-f', 'worst[ext=mp4]/worst',
            '--merge-output-format', 'mp4',
            '-o', tempFile,
            '--no-warnings',
            '--no-playlist',
            url,
        ], 120000);

        if (!existsSync(tempFile)) {
            throw new Error('動画ファイルのダウンロードに失敗しました。');
        }

        console.log(`✅ Downloaded: ${tempFile}`);

        // レスポンスヘッダー設定
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('X-Video-Title', encodeURIComponent(info.title));
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(info.title)}.mp4"`);

        // ファイルを読み込んで返す
        const videoBuffer = readFileSync(tempFile);
        res.send(videoBuffer);

        // 一時ファイル削除
        try { unlinkSync(tempFile); } catch (e) { /* ignore */ }

    } catch (error) {
        console.error('YouTube download error:', error);
        try { if (existsSync(tempFile)) unlinkSync(tempFile); } catch (e) { /* ignore */ }

        if (!res.headersSent) {
            res.status(500).json({
                message: error.message || 'YouTube動画の取得に失敗しました。',
            });
        }
    }
});

export default router;
