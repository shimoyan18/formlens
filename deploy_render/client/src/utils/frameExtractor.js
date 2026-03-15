/**
 * Canvas API を使って動画から等間隔で24フレームを抽出する
 * @param {File} videoFile - アップロードされた動画ファイル
 * @param {function} onProgress - 進捗コールバック (0-100)
 * @param {object} [options] - オプション
 * @param {number} [options.startTime] - 抽出開始時間（秒）
 * @param {number} [options.endTime] - 抽出終了時間（秒）
 * @returns {Promise<string[]>} Base64エンコードされたJPEG画像の配列
 */
export async function extractFrames(videoFile, onProgress = () => { }, options = {}) {
    const FRAME_COUNT = 24;

    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const frames = [];

        video.preload = 'auto';
        video.muted = true;
        video.playsInline = true;

        const objectUrl = URL.createObjectURL(videoFile);
        video.src = objectUrl;

        video.addEventListener('error', () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('動画の読み込みに失敗しました。対応するフォーマット（mp4, webm, mov）か確認してください。'));
        });

        video.addEventListener('loadedmetadata', () => {
            const totalDuration = video.duration;

            if (totalDuration <= 0 || !isFinite(totalDuration)) {
                URL.revokeObjectURL(objectUrl);
                reject(new Error('動画の長さを取得できませんでした。'));
                return;
            }

            // 開始・終了時間の決定（オプション指定があればそれを使用）
            const rangeStart = options.startTime != null ? Math.max(0, options.startTime) : 0;
            const rangeEnd = options.endTime != null ? Math.min(totalDuration, options.endTime) : totalDuration;
            const rangeDuration = rangeEnd - rangeStart;

            if (rangeDuration <= 0) {
                URL.revokeObjectURL(objectUrl);
                reject(new Error('選択範囲が不正です。'));
                return;
            }

            // 動画のサイズに合わせてcanvasを設定（最大幅640px）
            const maxWidth = 640;
            const scale = Math.min(1, maxWidth / video.videoWidth);
            canvas.width = Math.round(video.videoWidth * scale);
            canvas.height = Math.round(video.videoHeight * scale);

            // 選択範囲内で等間隔に24ポイントの時刻を計算（少しマージンを持たせる）
            const margin = rangeDuration * 0.02; // 2%のマージン
            const effectiveDuration = rangeDuration - margin * 2;
            const interval = effectiveDuration / (FRAME_COUNT - 1);
            const timestamps = Array.from({ length: FRAME_COUNT }, (_, i) => rangeStart + margin + i * interval);

            let currentIndex = 0;

            const captureFrame = () => {
                if (currentIndex >= FRAME_COUNT) {
                    URL.revokeObjectURL(objectUrl);
                    resolve(frames);
                    return;
                }

                video.currentTime = timestamps[currentIndex];
            };

            video.addEventListener('seeked', () => {
                // canvasに描画
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                frames.push(dataUrl);
                currentIndex++;
                onProgress(Math.round((currentIndex / FRAME_COUNT) * 100));
                captureFrame();
            });

            // 最初のフレームキャプチャ開始
            captureFrame();
        });
    });
}

