import { jsPDF } from 'jspdf';

/**
 * 24フレームの画像をPDFにまとめてダウンロードする
 * レイアウト: A4横、1ページにつき1枚、計24ページ
 * @param {string[]} frames - Base64エンコードされたJPEG画像のdata URL配列
 * @param {function} [onProgress] - 進捗コールバック (0-100)
 */
export async function exportFramesToPDF(frames, onProgress = () => { }) {
    // A4横: 297mm x 210mm
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageW = 297;
    const pageH = 210;
    const margin = 10;
    const headerH = 14;
    const footerH = 8;

    const usableW = pageW - margin * 2;
    const usableH = pageH - margin - headerH - footerH;

    // フェーズ情報 removed per user request

    for (let i = 0; i < frames.length; i++) {
        if (i > 0) pdf.addPage();

        // 背景
        pdf.setFillColor(20, 20, 25);
        pdf.rect(0, 0, pageW, pageH, 'F');

        // ヘッダー
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.setTextColor(255, 255, 255);
        pdf.text(`Frame ${i + 1} / ${frames.length}`, margin, margin + 8);


        pdf.text('FormLens', pageW - margin, margin + 8, { align: 'right' });

        // 画像のアスペクト比を取得
        const imgInfo = await loadImageDimensions(frames[i]);
        const imgAspect = imgInfo.width / imgInfo.height;
        const areaAspect = usableW / usableH;

        let drawW, drawH, drawX, drawY;
        if (imgAspect > areaAspect) {
            // 横長 → 幅に合わせる
            drawW = usableW;
            drawH = usableW / imgAspect;
        } else {
            // 縦長 → 高さに合わせる
            drawH = usableH;
            drawW = usableH * imgAspect;
        }
        drawX = margin + (usableW - drawW) / 2;
        drawY = margin + headerH + (usableH - drawH) / 2;

        // 画像背景（黒）
        pdf.setFillColor(0, 0, 0);
        pdf.roundedRect(drawX - 1, drawY - 1, drawW + 2, drawH + 2, 2, 2, 'F');

        // 画像
        pdf.addImage(frames[i], 'JPEG', drawX, drawY, drawW, drawH);

        // フッター
        pdf.setFontSize(7);
        pdf.setTextColor(100, 100, 110);
        pdf.text(`${i + 1} / ${frames.length}`, pageW / 2, pageH - margin + 2, { align: 'center' });

        onProgress(Math.round(((i + 1) / frames.length) * 100));
    }

    // ダウンロード
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    pdf.save(`FormLens_${dateStr}.pdf`);
}

/**
 * 画像のdata URLからサイズを取得する
 */
function loadImageDimensions(dataUrl) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = () => resolve({ width: 640, height: 360 }); // fallback 16:9
        img.src = dataUrl;
    });
}
