const phaseIcons = ['🏏', '⚡', '💥', '🌀'];
const phaseColors = [
    'from-blue-500/20 to-blue-600/10 border-blue-500/20',
    'from-amber-500/20 to-amber-600/10 border-amber-500/20',
    'from-red-500/20 to-red-600/10 border-red-500/20',
    'from-diamond-500/20 to-diamond-600/10 border-diamond-500/20',
];

export default function AnalysisResult({ analysis, onReset }) {
    if (!analysis) return null;

    return (
        <div className="space-y-8 animate-slide-up">
            {/* Overall Evaluation */}
            <div className="glass-card p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-diamond-500/20 to-gold-500/10">
                        <svg className="w-6 h-6 text-diamond-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                        </svg>
                    </div>
                    <h2 className="section-title">総合評価</h2>
                </div>
                <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                    {analysis.overall_evaluation}
                </p>
            </div>

            {/* Phase Analysis */}
            <div>
                <h2 className="section-title mb-6 flex items-center gap-2">
                    <span>📊</span> フェーズ別分析
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.phase_analysis.map((phase, index) => (
                        <div
                            key={index}
                            className={`rounded-2xl border p-6 bg-gradient-to-br ${phaseColors[index] || phaseColors[0]} transition-all duration-300 hover:scale-[1.01]`}
                            id={`phase-card-${index + 1}`}
                        >
                            {/* Phase Header */}
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-2xl">{phaseIcons[index] || '⚾'}</span>
                                <h3 className="font-bold text-gray-100 text-lg">{phase.phase}</h3>
                            </div>
                            {/* Good Point */}
                            <div className="mb-3">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">
                                    <span>✅</span> Good Point
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed pl-5">
                                    {phase.good_point}
                                </p>
                            </div>
                            {/* Advice */}
                            <div>
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">
                                    <span>💡</span> Advice
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed pl-5">
                                    {phase.advice}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Practice Menu */}
            <div className="glass-card p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-gold-500/20 to-gold-600/10">
                        <span className="text-xl">📋</span>
                    </div>
                    <h2 className="section-title">おすすめ練習メニュー</h2>
                </div>
                <div className="text-gray-300 text-sm md:text-base leading-relaxed whitespace-pre-line">
                    {analysis.practice_menu}
                </div>
            </div>

            {/* Reset Button */}
            <div className="text-center pt-4 pb-8">
                <button
                    onClick={onReset}
                    className="btn-secondary inline-flex items-center gap-2"
                    id="reset-analysis-btn"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182M2.985 19.644l3.182-3.182" />
                    </svg>
                    もう一度解析する
                </button>
            </div>
        </div>
    );
}
