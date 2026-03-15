import { useState, useCallback } from 'react';
import VideoUploader from './components/VideoUploader';
import VideoTrimmer from './components/VideoTrimmer';
import LoadingScreen from './components/LoadingScreen';
import FrameGrid from './components/FrameGrid';
import { extractFrames } from './utils/frameExtractor';
import { downloadYouTubeVideo } from './utils/api';

function App() {
    const [screen, setScreen] = useState('upload'); // 'upload' | 'trim' | 'loading' | 'result'
    const [videoFile, setVideoFile] = useState(null);
    const [frames, setFrames] = useState([]);
    const [progress, setProgress] = useState(0);
    const [loadingStep, setLoadingStep] = useState('');
    const [error, setError] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleVideoSelected = useCallback((file) => {
        setVideoFile(file);
        setError(null);
        setScreen('trim');
    }, []);

    const handleYouTubeSubmit = useCallback(async (url) => {
        setIsDownloading(true);
        setError(null);
        try {
            setScreen('loading');
            setLoadingStep('>> DOWNLOADING TARGET DATA...');
            setProgress(0);
            const file = await downloadYouTubeVideo(url);
            setVideoFile(file);
            setIsDownloading(false);
            setScreen('trim');
        } catch (err) {
            console.error('YouTube Error:', err);
            setError(err.message || 'YouTube動画の取得に失敗しました。');
            setScreen('upload');
            setIsDownloading(false);
        }
    }, []);

    const handleTrimConfirm = useCallback(async (file, startTime, endTime) => {
        setScreen('loading');
        setError(null);
        setProgress(0);
        setLoadingStep('>> EXTRACTING 24 FRAMES...');
        try {
            const extractedFrames = await extractFrames(file, (p) => {
                setProgress(p);
            }, { startTime, endTime });
            setFrames(extractedFrames);
            setScreen('result');
        } catch (err) {
            console.error('Extraction Error:', err);
            setError(err.message || '予期しないエラーが発生しました。');
            setScreen('trim');
        }
    }, []);

    const handleTrimBack = useCallback(() => {
        setVideoFile(null);
        setScreen('upload');
    }, []);

    const handleReset = useCallback(() => {
        setScreen('upload');
        setVideoFile(null);
        setFrames([]);
        setProgress(0);
        setError(null);
        setIsDownloading(false);
    }, []);

    return (
        <div className="min-h-screen bg-cyber-black circuit-bg">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-gradient-to-b from-cyber-deep/30 via-transparent to-cyber-deep/20 pointer-events-none" />

            {/* HUD Header */}
            <header className="fixed top-0 left-0 right-0 z-40" style={{ background: 'rgba(5, 5, 5, 0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #234B4C' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Logo */}
                        <div className="w-8 h-8 border border-cyber-green/60 flex items-center justify-center" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                            <span className="text-cyber-green text-xs font-heading font-bold">FL</span>
                        </div>
                        <div>
                            <span className="font-heading text-sm font-bold text-cyber-green tracking-wider glow-green">FORMLENS</span>
                            <span className="hidden sm:inline text-cyber-blue/60 text-[10px] font-mono ml-2">v2.4.1</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Dummy HUD data */}
                        <div className="hidden sm:flex items-center gap-3 text-[10px] font-mono text-cyber-blue/50">
                            <span>NET:<span className="text-cyber-green ml-1">ACTIVE</span></span>
                            <span className="text-cyber-border">|</span>
                            <span>UPLINK:<span className="text-cyber-green ml-1">128.7kb/s</span></span>
                            <span className="text-cyber-border">|</span>
                            <span>LAT:<span className="text-cyber-green ml-1">3ms</span></span>
                        </div>

                        {(screen === 'result' || screen === 'trim') && (
                            <button
                                onClick={handleReset}
                                className="text-[10px] font-heading tracking-wider text-cyber-red hover:glow-red transition-all flex items-center gap-1.5 border border-cyber-red/30 px-3 py-1.5 hover:border-cyber-red/60 hover:bg-cyber-red/10"
                                id="header-reset-btn"
                            >
                                [リセット]
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-8 sm:pt-24 sm:pb-12">
                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 border border-cyber-red/40 bg-cyber-red/5 text-cyber-red text-sm font-mono flex items-center gap-3 max-w-2xl mx-auto animate-fade-in">
                        <span className="text-lg">⚠</span>
                        <span className="flex-1">[ERROR] {error}</span>
                        <button onClick={() => setError(null)} className="hover:text-white text-xs">[×]</button>
                    </div>
                )}

                {screen === 'upload' && (
                    <VideoUploader
                        onVideoSelected={handleVideoSelected}
                        onYouTubeSubmit={handleYouTubeSubmit}
                        isDownloading={isDownloading}
                    />
                )}

                {screen === 'trim' && videoFile && (
                    <VideoTrimmer
                        videoFile={videoFile}
                        onConfirm={handleTrimConfirm}
                        onBack={handleTrimBack}
                    />
                )}

                {screen === 'loading' && (
                    <LoadingScreen progress={progress} step={loadingStep} />
                )}

                {screen === 'result' && (
                    <div className="space-y-8">
                        <section>
                            <h2 className="section-title mb-6 flex items-center gap-3">
                                <span className="text-cyber-green/40">&gt;&gt;</span> フレーム分解 完了
                            </h2>
                            <FrameGrid frames={frames} />
                        </section>

                        {/* Reset Button */}
                        <div className="text-center pt-4 pb-8">
                            <button
                                onClick={handleReset}
                                className="btn-secondary inline-flex items-center gap-2"
                                id="reset-btn"
                            >
                                <span className="text-cyber-blue/40">&gt;</span>
                                もう一度やり直す
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-cyber-border/40 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
                    <div className="text-[10px] font-mono text-cyber-green/30">
                        FormLens // TACTICAL FRAME DECOMPOSITION SYSTEM
                    </div>
                    <div className="text-[7px] font-mono text-cyber-blue/15 tracking-widest select-none" title="I thought what I'd do was, I'd pretend I was one of those deaf-mutes">
                        STAND ALONE COMPLEX
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default App;
