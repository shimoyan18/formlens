import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

// ダミーレスポンス（モックモード用）
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
 * POST /api/analyze
 * 24枚の画像を受け取り、Gemini APIでバッティングフォームを解析
 */
router.post('/analyze', async (req, res) => {
    try {
        const { images, mock } = req.body;

        if (!images || !Array.isArray(images) || images.length === 0) {
            return res.status(400).json({ message: '画像データが提供されていません。' });
        }

        // モックモード
        if (mock) {
            return res.json(MOCK_RESPONSE);
        }

        // Gemini API キー確認
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === 'your_api_key_here') {
            return res.status(500).json({
                message: 'GEMINI_API_KEY が設定されていません。server/.env を確認してください。',
            });
        }

        // Gemini API 呼び出し
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        // 画像を Gemini 用のフォーマットに変換
        const imageParts = images.map((dataUrl) => {
            const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
            return {
                inlineData: {
                    data: base64Data,
                    mimeType: 'image/jpeg',
                },
            };
        });

        const prompt = `あなたはプロの野球コーチです。以下の24枚の連続写真は、草野球選手の1スイング（バッティング）を等間隔で撮影したものです。

これらの画像を順番に分析し、バッティングフォームについて以下の観点で解析してください：

1. スイング全体の総合評価
2. 各フェーズごとの分析（良い点と改善アドバイス）
   - 構え〜テイクバック（フレーム1〜6付近）
   - トップ〜スイング開始（フレーム7〜12付近）
   - インパクト前後（フレーム13〜18付近）
   - フォロースルー（フレーム19〜24付近）
3. おすすめの練習メニュー

草野球選手向けに、専門用語を避けてわかりやすく説明してください。
具体的な体の部位や動きに言及し、実践しやすいアドバイスを心がけてください。

以下のJSON形式で出力してください。JSON以外のテキストは含めないでください：

{
  "overall_evaluation": "スイング全体の総評（草野球選手向けにわかりやすく）",
  "phase_analysis": [
    {
      "phase": "構え〜テイクバック",
      "good_point": "できている良い部分",
      "advice": "改善のための具体的なアドバイス"
    },
    {
      "phase": "トップ〜スイング開始",
      "good_point": "できている良い部分",
      "advice": "改善のための具体的なアドバイス"
    },
    {
      "phase": "インパクト前後",
      "good_point": "できている良い部分",
      "advice": "改善のための具体的なアドバイス"
    },
    {
      "phase": "フォロースルー",
      "good_point": "できている良い部分",
      "advice": "改善のための具体的なアドバイス"
    }
  ],
  "practice_menu": "おすすめの練習法（改行区切りで複数記載）"
}`;

        const result = await model.generateContent([prompt, ...imageParts]);
        const responseText = result.response.text();

        // JSON部分を抽出してパース
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('AIからの応答をJSON形式で解析できませんでした。');
        }

        const analysisResult = JSON.parse(jsonMatch[0]);
        return res.json(analysisResult);
    } catch (error) {
        console.error('Analysis error:', error);
        return res.status(500).json({
            message: `解析中にエラーが発生しました: ${error.message}`,
        });
    }
});

export default router;
