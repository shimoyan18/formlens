const MOCK_RESPONSE = {
    overall_evaluation:
        '全体的にバランスの取れたスイングです。構えの姿勢が安定しており、下半身の使い方も良好です。テイクバックからインパクトまでの軌道がやや遠回りしているため、バットの出し方を改善するとさらに打球速度が上がるでしょう。フォロースルーは大きく取れており、パワーを最後までボールに伝えようとする意識が見られます。',
    phase_analysis: [
        {
            phase: '構え〜テイクバック',
            good_point:
                '足幅が肩幅程度で安定しています。グリップの位置も適切で、リラックスした構えができています。',
            advice:
                'テイクバック時にやや上体が前に突っ込む傾向があります。軸足（後ろ足）にしっかり体重を乗せ、「壁を作る」ことを意識しましょう。目安として、後ろ足の膝が外側に流れないよう注意してください。',
        },
        {
            phase: 'トップ〜スイング開始',
            good_point:
                'トップの位置が高すぎず低すぎず、良いポジションです。下半身から始動できている点も良いです。',
            advice:
                'バットのヘッドがやや寝ている（水平に近い）ため、ボールの下を叩きやすくなっています。トップでバットを少し立てる意識を持つと、スイング軌道がコンパクトになります。',
        },
        {
            phase: 'インパクト前後',
            good_point:
                'インパクトの瞬間に前足がしっかり踏ん張れており、パワーをボールに伝えられています。',
            advice:
                'インパクト時に頭が前に動いているため、ボールを見る時間が短くなっています。「頭を残す」ことを意識し、軸がブレないようにしましょう。ティーバッティングで頭の位置を固定する練習が効果的です。',
        },
        {
            phase: 'フォロースルー',
            good_point:
                '大きなフォロースルーが取れており、スイングにパワーが感じられます。バットを最後まで振り切れています。',
            advice:
                'フォロースルーで上体が一塁側（右打者の場合）に流れる傾向があります。フィニッシュ時に体の軸がまっすぐ保てるよう、体幹トレーニングを取り入れましょう。',
        },
    ],
    practice_menu:
        '【おすすめ練習メニュー】\n1. ティーバッティング（頭を固定する意識）: 20球×3セット\n2. 素振り（トップでバットを立てる意識）: 30回×3セット\n3. 片足立ちスイング（軸足のバランス強化）: 15回×2セット\n4. 体幹トレーニング（プランク30秒、サイドプランク各20秒）: 3セット\n\nこれらを週3〜4回行うことで、1ヶ月後には明確な改善が期待できます。',
};

/**
 * バックエンドAPIを呼び出してAI解析を実行
 * @param {string[]} images - Base64エンコードされた画像の配列
 * @param {boolean} useMock - モックモードを使用するか
 * @returns {Promise<object>} AI解析結果
 */
export async function analyzeSwing(images, useMock = false) {
    if (useMock) {
        // モックモード: 2秒のディレイ後にダミーデータを返却
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return MOCK_RESPONSE;
    }

    const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'サーバーエラーが発生しました' }));
        throw new Error(error.message || `API Error: ${response.status}`);
    }

    return response.json();
}

/**
 * YouTube URLから動画情報を取得
 * @param {string} url - YouTube URL
 * @returns {Promise<{title: string, duration: number, thumbnail: string, author: string}>}
 */
export async function getYouTubeInfo(url) {
    const response = await fetch('/api/youtube/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'YouTube情報の取得に失敗しました' }));
        throw new Error(error.message || `API Error: ${response.status}`);
    }

    return response.json();
}

/**
 * YouTube URLから動画をダウンロードしてBlobとして返す
 * @param {string} url - YouTube URL
 * @param {function} onProgress - 進捗コールバック (未実装だがインターフェース統一のため)
 * @returns {Promise<File>} ダウンロードされた動画ファイル
 */
export async function downloadYouTubeVideo(url, onProgress = () => { }) {
    const response = await fetch('/api/youtube/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
    });

    if (!response.ok) {
        // JSONエラーレスポンスをチェック
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const error = await response.json();
            throw new Error(error.message || 'ダウンロードに失敗しました');
        }
        throw new Error(`ダウンロードに失敗しました (${response.status})`);
    }

    // タイトルをヘッダーから取得
    const titleHeader = response.headers.get('X-Video-Title');
    const title = titleHeader ? decodeURIComponent(titleHeader) : 'youtube_video';

    const blob = await response.blob();
    return new File([blob], `${title}.mp4`, { type: 'video/mp4' });
}
