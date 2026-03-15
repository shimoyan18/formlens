export default function LoadingScreen({ progress, step }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
            {/* Scanning HUD */}
            <div className="relative mb-10">
                <div className="w-28 h-28 border border-cyber-green/30 flex items-center justify-center"
                    style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                    {/* Inner hexagon */}
                    <div className="w-20 h-20 border border-cyber-green/20 flex items-center justify-center animate-spin"
                        style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', animationDuration: '6s' }}>
                        <div className="w-12 h-12 border border-cyber-green/40 flex items-center justify-center animate-spin"
                            style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', animationDuration: '3s', animationDirection: 'reverse' }}>
                            <span className="text-cyber-green text-lg font-heading font-bold animate-pulse-glow"
                                style={{ animationDuration: '1.5s' }}>
                                {progress}%
                            </span>
                        </div>
                    </div>
                </div>
                {/* Scanning line */}
                <div className="absolute inset-0 overflow-hidden"
                    style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyber-green/50 to-transparent animate-scanline" />
                </div>
            </div>

            {/* Step Text */}
            <h2 className="font-heading text-sm tracking-[0.2em] text-cyber-green mb-2 glow-green uppercase">{step}</h2>
            <p className="text-cyber-blue/40 text-[10px] font-mono mb-8 animate-flicker">処理中...</p>

            {/* Progress Bar */}
            <div className="w-full max-w-md">
                <div className="flex justify-between text-[10px] font-mono mb-2">
                    <span className="text-cyber-blue/40">進捗</span>
                    <span className="text-cyber-green">{progress}%</span>
                </div>
                <div className="h-1 bg-cyber-border/30 overflow-hidden">
                    <div
                        className="h-full transition-all duration-300 ease-out"
                        style={{
                            width: `${progress}%`,
                            background: 'linear-gradient(90deg, #4AF626, #8AE2FF)',
                            boxShadow: '0 0 10px rgba(74, 246, 38, 0.5)',
                        }}
                    />
                </div>
            </div>

            {/* Processing Steps */}
            <div className="mt-8 space-y-2.5">
                {[
                    ...(step.includes('DOWNLOAD') || step.includes('ダウンロード') ? [{ label: '>> 動画をダウンロード中', done: !step.includes('DOWNLOAD'), active: step.includes('DOWNLOAD') }] : []),
                    { label: '>> 動画を読み込み中', done: progress > 0 },
                    { label: '>> フレームを抽出中', done: progress >= 100 },
                ].map((s) => (
                    <div key={s.label} className="flex items-center gap-3 text-[11px] font-mono">
                        {s.done ? (
                            <span className="text-cyber-green">[OK]</span>
                        ) : s.active ? (
                            <span className="text-cyber-green animate-flicker">[..]</span>
                        ) : (
                            <span className="text-cyber-border">[--]</span>
                        )}
                        <span className={s.done ? 'text-cyber-green/50' : s.active ? 'text-cyber-green' : 'text-cyber-blue/25'}>
                            {s.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
