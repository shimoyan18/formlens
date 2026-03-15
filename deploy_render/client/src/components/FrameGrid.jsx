import { useState, useRef, useCallback, useEffect } from 'react';
import { exportFramesToPDF } from '../utils/pdfExport';

// Phase functions removed per user request

export default function FrameGrid({ frames }) {
    const [selectedFrame, setSelectedFrame] = useState(null);
    const [pdfProgress, setPdfProgress] = useState(null);
    const touchStartRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (selectedFrame !== null) {
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = ''; };
        }
    }, [selectedFrame]);

    const handleTouchStart = useCallback((e) => {
        touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, []);

    const handleTouchEnd = useCallback((e) => {
        if (selectedFrame === null) return;
        const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
        const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
        if (Math.abs(dx) < 40 && Math.abs(dy) < 40) return;
        if (Math.abs(dy) > Math.abs(dx) && dy > 60) {
            setSelectedFrame(null);
        } else if (Math.abs(dx) > Math.abs(dy)) {
            if (dx < -40 && selectedFrame < frames.length - 1) setSelectedFrame(selectedFrame + 1);
            else if (dx > 40 && selectedFrame > 0) setSelectedFrame(selectedFrame - 1);
        }
    }, [selectedFrame, frames.length]);

    const handleDownloadPDF = useCallback(async () => {
        if (pdfProgress !== null) return;
        setPdfProgress(0);
        try {
            await exportFramesToPDF(frames, (p) => setPdfProgress(p));
        } catch (err) {
            console.error('PDF Error:', err);
            alert('[ERROR] PDFの生成に失敗しました。');
        } finally {
            setPdfProgress(null);
        }
    }, [frames, pdfProgress]);

    return (
        <div>
            {/* Phase Legend removed per user request */}

            {/* Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1 sm:gap-1.5 md:gap-2">
                {frames.map((frame, index) => {
                    const borderColor = '#4AF626'; // cyber-green
                    return (
                        <button
                            key={index}
                            onClick={() => setSelectedFrame(selectedFrame === index ? null : index)}
                            className={`
                                relative group overflow-hidden border transition-all duration-200
                                ${selectedFrame === index
                                    ? 'scale-[1.03]'
                                    : 'hover:scale-[1.02] active:scale-95'
                                }
                            `}
                            style={{
                                borderColor: selectedFrame === index ? borderColor : '#234B4C',
                                boxShadow: selectedFrame === index ? `0 0 12px ${borderColor}40` : 'none',
                            }}
                            id={`frame-${index + 1}`}
                        >
                            <img
                                src={frame}
                                alt={`Frame ${index + 1}`}
                                className="w-full aspect-video object-cover"
                            />
                            {/* Frame number badge removed per user request */}
                            {/* HUD hover overlay */}
                            <div className="absolute inset-0 bg-transparent group-hover:bg-cyber-black/30 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <div className="w-6 h-6 border border-cyber-green/50 rounded-full" />
                                <div className="absolute w-px h-3 bg-cyber-green/50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                <div className="absolute w-3 h-px bg-cyber-green/50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* PDF Download Button */}
            <div className="mt-8 sm:mt-10 flex justify-center">
                <button
                    onClick={handleDownloadPDF}
                    disabled={pdfProgress !== null}
                    className={`
                        relative overflow-hidden inline-flex items-center gap-2.5 font-heading text-xs tracking-wider uppercase transition-all duration-200
                        ${pdfProgress !== null
                            ? 'px-6 py-3 bg-cyber-green/5 text-cyber-green/50 border border-cyber-border cursor-wait'
                            : 'btn-primary'
                        }
                    `}
                    id="download-pdf-btn"
                >
                    {pdfProgress !== null && (
                        <div className="absolute left-0 top-0 bottom-0 bg-cyber-green/10 transition-all duration-300"
                            style={{ width: `${pdfProgress}%` }} />
                    )}
                    <span className="relative flex items-center gap-2.5">
                        {pdfProgress !== null ? (
                            <>
                                <div className="w-4 h-4 border border-cyber-green/30 border-t-cyber-green rounded-full animate-spin" />
                                GENERATING... {pdfProgress}%
                            </>
                        ) : (
                            <>
                                <span className="text-[8px]">▶</span>
                                PDFでダウンロード
                            </>
                        )}
                    </span>
                </button>
            </div>

            {/* Enlarged View Modal */}
            {selectedFrame !== null && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
                    style={{ background: 'rgba(5, 5, 5, 0.92)', backdropFilter: 'blur(8px)' }}
                    onClick={() => setSelectedFrame(null)}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    <div className="relative max-w-3xl w-full animate-fade-in" onClick={(e) => e.stopPropagation()}>
                        <div className="border border-cyber-border p-1">
                            <img
                                src={frames[selectedFrame]}
                                alt={`Frame ${selectedFrame + 1}`}
                                className="w-full"
                            />
                        </div>

                        {/* HUD info */}
                        <div className="absolute top-3 left-3 px-2.5 py-1 border border-cyber-green/40 bg-cyber-black/80 text-cyber-green text-[10px] font-mono tracking-wider">
                            フレーム {String(selectedFrame + 1).padStart(2, '0')} / {frames.length}
                        </div>

                        {/* Close */}
                        <button
                            onClick={() => setSelectedFrame(null)}
                            className="absolute top-3 right-3 p-1.5 border border-cyber-red/40 bg-cyber-black/80 hover:border-cyber-red text-cyber-red transition-colors text-[10px] font-heading z-10"
                        >
                            [閉じる]
                        </button>

                        {/* Left Arrow */}
                        {selectedFrame > 0 && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setSelectedFrame(selectedFrame - 1); }}
                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 sm:-translate-x-14 w-10 h-16 sm:w-12 sm:h-20 flex items-center justify-center
                                           border border-cyber-green/40 bg-cyber-black/80 hover:border-cyber-green hover:bg-cyber-green/10 
                                           text-cyber-green transition-all active:scale-90 z-10"
                                style={{ clipPath: 'polygon(40% 0%, 100% 0%, 100% 100%, 40% 100%, 0% 50%)' }}
                            >
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 ml-1" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                                </svg>
                            </button>
                        )}

                        {/* Right Arrow */}
                        {selectedFrame < frames.length - 1 && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setSelectedFrame(selectedFrame + 1); }}
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 sm:translate-x-14 w-10 h-16 sm:w-12 sm:h-20 flex items-center justify-center
                                           border border-cyber-green/40 bg-cyber-black/80 hover:border-cyber-green hover:bg-cyber-green/10 
                                           text-cyber-green transition-all active:scale-90 z-10"
                                style={{ clipPath: 'polygon(0% 0%, 60% 0%, 100% 50%, 60% 100%, 0% 100%)' }}
                            >
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 -ml-1" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                </svg>
                            </button>
                        )}

                        {/* Corner decorations */}
                        <div className="absolute top-1 left-1 w-4 h-4 border-t border-l border-cyber-green/30" />
                        <div className="absolute top-1 right-1 w-4 h-4 border-t border-r border-cyber-green/30" />
                        <div className="absolute bottom-1 left-1 w-4 h-4 border-b border-l border-cyber-green/30" />
                        <div className="absolute bottom-1 right-1 w-4 h-4 border-b border-r border-cyber-green/30" />

                        <p className="sm:hidden text-center text-cyber-blue/25 text-[9px] font-mono mt-2">← → スワイプで移動 // ↓ 閉じる</p>
                    </div>
                </div>
            )}
        </div>
    );
}
