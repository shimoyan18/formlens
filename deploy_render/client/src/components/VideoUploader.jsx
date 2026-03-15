import { useState, useRef, useCallback } from 'react';

export default function VideoUploader({ onVideoSelected, onYouTubeSubmit, isDownloading }) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [preview, setPreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [inputMode, setInputMode] = useState('file');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [youtubeError, setYoutubeError] = useState('');
    const fileInputRef = useRef(null);

    const handleFile = useCallback((file) => {
        if (!file) return;
        const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
        if (!validTypes.includes(file.type) && !file.name.match(/\.(mp4|webm|mov|avi)$/i)) {
            alert('対応する動画フォーマット（mp4, webm, mov）を選択してください。');
            return;
        }
        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
        handleFile(e.dataTransfer.files[0]);
    }, [handleFile]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragOver(false);
    }, []);

    const handleFileInput = useCallback((e) => {
        handleFile(e.target.files[0]);
    }, [handleFile]);

    const handleAnalyze = () => {
        if (selectedFile) onVideoSelected(selectedFile);
    };

    const handleReset = () => {
        setSelectedFile(null);
        if (preview) URL.revokeObjectURL(preview);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const isValidYouTubeUrl = (url) => {
        return /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)[\w-]+/.test(url);
    };

    const handleYouTubeSubmit = () => {
        setYoutubeError('');
        if (!youtubeUrl.trim()) {
            setYoutubeError('URLを入力してください。');
            return;
        }
        if (!isValidYouTubeUrl(youtubeUrl.trim())) {
            setYoutubeError('有効なYouTube URLを入力してください。');
            return;
        }
        onYouTubeSubmit(youtubeUrl.trim());
    };

    return (
        <div className="animate-fade-in">
            {/* Hero Section */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-cyber-border text-cyber-blue text-[10px] font-heading tracking-[0.3em] uppercase mb-8">
                    <span className="w-1.5 h-1.5 bg-cyber-green rounded-full animate-pulse-glow" />
                    TACTICAL FRAME DECOMPOSITION
                </div>

                <h1 className="text-4xl md:text-6xl font-heading font-black mb-6 tracking-wider">
                    <span className="text-gradient glow-green">FORMLENS</span>
                </h1>

            </div>

            {/* Input Mode Tabs */}
            {!preview && (
                <div className="flex flex-col items-center mb-10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-[1px] bg-cyber-blue/20"></div>
                        <p className="text-cyber-blue/60 text-[10px] font-mono tracking-[0.2em] uppercase">読込方法を選択</p>
                        <div className="w-12 h-[1px] bg-cyber-blue/20"></div>
                    </div>
                    <div className="inline-flex p-1 border border-cyber-border/40 bg-black/40 relative">
                        {/* Selector Highlight Layer (Optional, implicit via button bg) */}
                        <button
                            onClick={() => setInputMode('file')}
                            className={`px-8 py-3 text-[11px] font-mono tracking-wider transition-all duration-300 flex items-center gap-2 z-10 ${inputMode === 'file'
                                ? 'bg-cyber-green/10 text-cyber-green border border-cyber-green/40 shadow-[0_0_15px_rgba(74,246,38,0.1)]'
                                : 'text-cyber-blue/40 hover:text-cyber-blue/80 hover:bg-cyber-green/5 border border-transparent'
                                }`}
                            id="tab-file"
                        >
                            <span className={`text-[10px] transition-transform duration-300 ${inputMode === 'file' ? 'rotate-90 text-cyber-green' : 'text-cyber-blue/40'}`}>▶</span> 端末の動画
                        </button>
                        <button
                            onClick={() => setInputMode('youtube')}
                            className={`px-8 py-3 text-[11px] font-mono tracking-wider transition-all duration-300 flex items-center gap-2 z-10 ${inputMode === 'youtube'
                                ? 'bg-cyber-red/10 text-cyber-red border border-cyber-red/40 shadow-[0_0_15px_rgba(255,42,42,0.1)]'
                                : 'text-cyber-blue/40 hover:text-cyber-blue/80 hover:bg-cyber-red/5 border border-transparent'
                                }`}
                            id="tab-youtube"
                        >
                            <span className={`text-[10px] transition-transform duration-300 ${inputMode === 'youtube' ? 'rotate-90 text-cyber-red' : 'text-cyber-blue/40'}`}>▶</span> YouTube URL
                        </button>
                    </div>
                </div>
            )}

            {/* File Upload Mode */}
            {inputMode === 'file' && !preview && (
                <div
                    id="drop-zone"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                        relative cursor-pointer mx-auto max-w-2xl
                        border border-dashed p-12 text-center
                        transition-all duration-300 group
                        ${isDragOver
                            ? 'border-cyber-green bg-cyber-green/5'
                            : 'border-cyber-border hover:border-cyber-green/50 hover:bg-cyber-green/3'
                        }
                    `}
                    style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                        onChange={handleFileInput}
                        className="hidden"
                        id="video-input"
                    />

                    <div className="mb-5">
                        <div className={`
                            inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20
                            border border-cyber-green/30
                            group-hover:border-cyber-green/60
                            transition-all duration-300
                            ${isDragOver ? 'border-cyber-green bg-cyber-green/10' : ''}
                        `}
                            style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                        >
                            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-cyber-green/70" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                            </svg>
                        </div>
                    </div>

                    {/* Desktop */}
                    <p className="hidden sm:block text-cyber-green/70 font-mono text-sm mb-2">
                        動画をドラッグ＆ドロップ
                    </p>
                    <p className="hidden sm:block text-cyber-blue/40 text-xs font-mono">
                        または <span className="text-cyber-green underline underline-offset-2 cursor-pointer">ファイルを選択</span>
                    </p>

                    {/* Mobile */}
                    <p className="sm:hidden text-cyber-green/70 font-mono text-sm mb-3">
                        タップして動画を選択
                    </p>

                    <p className="text-cyber-blue/30 text-[10px] font-mono mt-4 tracking-wider">
                        対応形式: MP4 / WEBM / MOV
                    </p>

                    {/* Corner decorations */}
                    <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-cyber-green/30" />
                    <div className="absolute top-2 right-6 w-4 h-4 border-t border-r border-cyber-green/30" />
                    <div className="absolute bottom-5 left-5 w-4 h-4 border-b border-l border-cyber-green/30" />
                    <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-cyber-green/30" />
                </div>
            )}

            {/* YouTube URL Mode */}
            {inputMode === 'youtube' && !preview && (
                <div className="mx-auto max-w-2xl animate-fade-in">
                    <div className="glass-card p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 border border-cyber-red/30">
                                <svg className="w-5 h-5 text-cyber-red" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-heading text-xs tracking-wider text-cyber-green uppercase">YouTube動画の取得</h3>
                                <p className="text-cyber-blue/40 text-[10px] font-mono mt-0.5">URLを入力してください（5分以内の動画）</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="relative">
                                <input
                                    type="url"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    value={youtubeUrl}
                                    onChange={(e) => { setYoutubeUrl(e.target.value); setYoutubeError(''); }}
                                    onKeyDown={(e) => e.key === 'Enter' && !isDownloading && handleYouTubeSubmit()}
                                    disabled={isDownloading}
                                    className="w-full px-4 py-3 bg-cyber-black/60 border border-cyber-border text-cyber-green font-mono text-sm placeholder-cyber-blue/20
                                               focus:outline-none focus:border-cyber-green/60 focus:shadow-[0_0_10px_rgba(74,246,38,0.1)] transition-all
                                               disabled:opacity-50"
                                    id="youtube-url-input"
                                />
                                {youtubeUrl && !isDownloading && (
                                    <button
                                        onClick={() => { setYoutubeUrl(''); setYoutubeError(''); }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-blue/40 hover:text-cyber-red transition-colors text-[10px] font-mono"
                                    >
                                        [消去]
                                    </button>
                                )}
                            </div>

                            {youtubeError && (
                                <p className="text-cyber-red text-xs font-mono flex items-center gap-1.5">
                                    <span>⚠</span> {youtubeError}
                                </p>
                            )}

                            <button
                                onClick={handleYouTubeSubmit}
                                disabled={isDownloading || !youtubeUrl.trim()}
                                className="w-full px-6 py-3 bg-cyber-red/10 text-cyber-red font-mono text-xs tracking-wider
                                           border border-cyber-red/40 hover:border-cyber-red hover:bg-cyber-red/20 hover:shadow-[0_0_15px_rgba(255,42,42,0.2)]
                                           transition-all duration-300 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed
                                           flex items-center justify-center gap-2"
                                id="youtube-submit-btn"
                            >
                                {isDownloading ? (
                                    <>
                                        <div className="w-4 h-4 border border-cyber-red/30 border-t-cyber-red rounded-full animate-spin" />
                                        ダウンロード中...
                                    </>
                                ) : (
                                    <>
                                        <span className="text-[8px]">▶</span>
                                        動画を取得して分解
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="mt-5 pt-5 border-t border-cyber-border/40">
                            <p className="text-cyber-blue/25 text-[10px] font-mono leading-relaxed">
                                &gt; YouTube Shorts / 通常動画URL対応
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* File Preview */}
            {preview && (
                <div className="max-w-2xl mx-auto animate-slide-up">
                    <div className="glass-card overflow-hidden">
                        <div className="relative">
                            <video
                                src={preview}
                                controls
                                className="w-full aspect-video bg-black"
                                id="video-preview"
                            />
                            <div className="absolute top-3 right-3">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleReset(); }}
                                    className="p-2 border border-cyber-red/40 bg-cyber-black/80 hover:border-cyber-red hover:bg-cyber-red/20 text-cyber-red transition-all duration-200"
                                    id="reset-btn"
                                    title="取り消し"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="absolute top-2 left-2 w-6 h-6 border-t border-l border-cyber-green/40" />
                            <div className="absolute bottom-2 right-2 w-6 h-6 border-b border-r border-cyber-green/40" />
                        </div>
                        <div className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse-glow" />
                                <div>
                                    <p className="text-xs font-mono text-cyber-green truncate max-w-[200px]">{selectedFile?.name}</p>
                                    <p className="text-[10px] font-mono text-cyber-blue/40">
                                        サイズ: {selectedFile && (selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleAnalyze}
                                className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
                                id="analyze-btn"
                            >
                                <span className="text-[8px]">▶</span>
                                範囲を選んで分解
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* User Flow (How to use) */}
            <div className="mt-16 max-w-4xl mx-auto">
                <div className="flex items-center justify-center gap-4 mb-8">
                    <div className="w-12 h-px bg-cyber-green/30"></div>
                    <div className="text-[10px] font-heading text-cyber-green tracking-[0.3em] uppercase">HOW TO USE</div>
                    <div className="w-12 h-px bg-cyber-green/30"></div>
                </div>
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                    {[
                        { step: '01', title: '動画の読み込み', desc: 'ファイル選択、またはYouTubeのURLを入力して動画を読み込みます。' },
                        { step: '02', title: '範囲の指定', desc: 'プレビュー画面から、分解したいフォームの範囲を選びます。' },
                        { step: '03', title: '24コマに分解', desc: 'ワンタップで自動的に24フレームに分解。PDFでの出力も可能です。' },
                    ].map((flow) => (
                        <div key={flow.step} className="flex flex-col items-center w-full md:w-1/3 h-full">
                            <div className="glass-card p-6 text-center group glitch-hover w-full h-full flex flex-col justify-center">
                                <div className="text-cyber-blue/30 font-heading text-2xl font-bold mb-3">{flow.step}</div>
                                <h3 className="font-mono text-[13px] tracking-wider text-cyber-green mb-3">{flow.title}</h3>
                                <p className="text-cyber-blue/50 text-[11px] font-mono leading-relaxed">{flow.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
