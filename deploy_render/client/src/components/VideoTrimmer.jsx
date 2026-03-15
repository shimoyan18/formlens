import { useState, useRef, useCallback, useEffect } from 'react';

function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) return '0:00.0';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${m}:${s.toString().padStart(2, '0')}.${ms}`;
}

export default function VideoTrimmer({ videoFile, onConfirm, onBack }) {
    const videoRef = useRef(null);
    const timelineRef = useRef(null);
    const playheadRef = useRef(null);
    const animFrameRef = useRef(null);
    const dragStartRef = useRef(null);

    const [duration, setDuration] = useState(0);
    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isDragging, setIsDragging] = useState(null);
    const [videoUrl, setVideoUrl] = useState(null);
    const [displayTime, setDisplayTime] = useState(0);

    useEffect(() => {
        const url = URL.createObjectURL(videoFile);
        setVideoUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [videoFile]);

    const updatePlayhead = useCallback(() => {
        const vid = videoRef.current;
        const el = playheadRef.current;
        if (!vid || !el || !vid.duration) return;
        el.style.left = `${(vid.currentTime / vid.duration) * 100}%`;
        if (vid.currentTime >= endTime) {
            vid.pause();
            vid.currentTime = startTime;
            setIsPlaying(false);
        }
        if (!vid.paused) animFrameRef.current = requestAnimationFrame(updatePlayhead);
    }, [startTime, endTime]);

    useEffect(() => {
        if (isPlaying) animFrameRef.current = requestAnimationFrame(updatePlayhead);
        return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
    }, [isPlaying, updatePlayhead]);

    useEffect(() => {
        if (!isPlaying) return;
        const interval = setInterval(() => {
            const vid = videoRef.current;
            if (vid) setDisplayTime(vid.currentTime);
        }, 500);
        return () => clearInterval(interval);
    }, [isPlaying]);

    const handleLoadedMetadata = useCallback(() => {
        const vid = videoRef.current;
        if (vid) { setDuration(vid.duration); setEndTime(vid.duration); }
    }, []);

    const togglePlay = useCallback(() => {
        const vid = videoRef.current;
        if (!vid) return;
        if (isPlaying) { vid.pause(); setIsPlaying(false); setDisplayTime(vid.currentTime); }
        else { if (vid.currentTime < startTime || vid.currentTime >= endTime) vid.currentTime = startTime; vid.play(); setIsPlaying(true); }
    }, [isPlaying, startTime, endTime]);

    const playSelection = useCallback(() => {
        const vid = videoRef.current;
        if (!vid) return;
        vid.currentTime = startTime;
        vid.play();
        setIsPlaying(true);
    }, [startTime]);

    const getTimeFromPosition = useCallback((clientX) => {
        const rect = timelineRef.current?.getBoundingClientRect();
        if (!rect) return 0;
        return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) * duration;
    }, [duration]);

    const handleHandleDown = useCallback((e, type) => {
        e.preventDefault(); e.stopPropagation();
        const clientX = e.clientX ?? e.touches?.[0]?.clientX;
        dragStartRef.current = { type, clientX, moved: false };
        setIsDragging(type);
    }, []);

    const handleTimelineClick = useCallback((e) => {
        if (isDragging) return;
        const clientX = e.clientX ?? e.touches?.[0]?.clientX;
        if (clientX == null) return;
        const rect = timelineRef.current?.getBoundingClientRect();
        if (rect && duration > 0) {
            const tapTime = ((clientX - rect.left) / rect.width) * duration;
            const handleRange = duration * (30 / rect.width);
            const startDist = Math.abs(tapTime - startTime);
            const endDist = Math.abs(tapTime - endTime);
            if (startDist < handleRange && startDist <= endDist) {
                dragStartRef.current = { type: 'start', clientX, moved: false }; setIsDragging('start'); return;
            }
            if (endDist < handleRange) {
                dragStartRef.current = { type: 'end', clientX, moved: false }; setIsDragging('end'); return;
            }
        }
        const time = getTimeFromPosition(clientX);
        const vid = videoRef.current;
        if (vid) { vid.currentTime = time; setDisplayTime(time); const el = playheadRef.current; if (el && vid.duration) el.style.left = `${(time / vid.duration) * 100}%`; }
    }, [getTimeFromPosition, isDragging, startTime, endTime, duration]);

    const handlePointerMove = useCallback((e) => {
        if (!isDragging) return;
        e.preventDefault();
        const clientX = e.clientX ?? e.touches?.[0]?.clientX;
        if (clientX == null) return;
        if (dragStartRef.current) dragStartRef.current.moved = true;
        const time = getTimeFromPosition(clientX);
        if (isDragging === 'start') {
            const n = Math.max(0, Math.min(time, endTime - 0.3)); setStartTime(n);
            const vid = videoRef.current; if (vid) { vid.currentTime = n; setDisplayTime(n); }
        } else if (isDragging === 'end') {
            const n = Math.min(duration, Math.max(time, startTime + 0.3)); setEndTime(n);
            const vid = videoRef.current; if (vid) { vid.currentTime = n; setDisplayTime(n); }
        }
    }, [isDragging, getTimeFromPosition, startTime, endTime, duration]);

    const handlePointerUp = useCallback(() => { dragStartRef.current = null; setIsDragging(null); }, []);

    useEffect(() => {
        if (isDragging) {
            const opts = { passive: false };
            window.addEventListener('mousemove', handlePointerMove);
            window.addEventListener('mouseup', handlePointerUp);
            window.addEventListener('touchmove', handlePointerMove, opts);
            window.addEventListener('touchend', handlePointerUp);
            document.body.style.overflow = 'hidden'; document.body.style.touchAction = 'none';
            return () => {
                window.removeEventListener('mousemove', handlePointerMove);
                window.removeEventListener('mouseup', handlePointerUp);
                window.removeEventListener('touchmove', handlePointerMove);
                window.removeEventListener('touchend', handlePointerUp);
                document.body.style.overflow = ''; document.body.style.touchAction = '';
            };
        }
    }, [isDragging, handlePointerMove, handlePointerUp]);

    const adjustTime = useCallback((type, delta) => {
        if (type === 'start') setStartTime(prev => Math.round(Math.max(0, Math.min(prev + delta, endTime - 0.3)) * 10) / 10);
        else setEndTime(prev => Math.round(Math.min(duration, Math.max(prev + delta, startTime + 0.3)) * 10) / 10);
    }, [startTime, endTime, duration]);

    const seekTo = useCallback((time) => {
        const vid = videoRef.current;
        if (vid) { vid.currentTime = time; setDisplayTime(time); const el = playheadRef.current; if (el && vid.duration) el.style.left = `${(time / vid.duration) * 100}%`; }
    }, []);

    const selectedDuration = endTime - startTime;
    const startPct = duration > 0 ? (startTime / duration) * 100 : 0;
    const endPct = duration > 0 ? (endTime / duration) * 100 : 100;

    return (
        <div className="max-w-4xl mx-auto space-y-5 sm:space-y-6 animate-fade-in">
            {/* Header */}
            <div className="text-center">
                <h2 className="section-title text-sm sm:text-base mb-2 flex items-center justify-center gap-2">
                    <span className="text-cyber-green/40">&gt;&gt;</span> 範囲を指定
                </h2>
                <p className="text-cyber-blue/40 text-[10px] font-mono">
                    分解する範囲を指定してください
                </p>
            </div>

            {/* Video Player */}
            <div className="glass-card overflow-hidden">
                <div className="relative bg-cyber-black">
                    {videoUrl && (
                        <video
                            ref={videoRef} src={videoUrl}
                            className="w-full max-h-[50vh] object-contain"
                            onLoadedMetadata={handleLoadedMetadata}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => { setIsPlaying(false); setDisplayTime(videoRef.current?.currentTime || 0); }}
                            playsInline muted id="trim-video"
                        />
                    )}
                    <button onClick={togglePlay}
                        className="absolute inset-0 flex items-center justify-center bg-transparent hover:bg-cyber-black/20 transition-colors group"
                        id="trim-play-btn">
                        <div className={`w-14 h-14 sm:w-16 sm:h-16 border flex items-center justify-center transition-all
                            ${isPlaying ? 'border-cyber-green/20 opacity-0 group-hover:opacity-100' : 'border-cyber-green/40 hover:border-cyber-green/80'}`}
                            style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                            {isPlaying ? (
                                <svg className="w-6 h-6 text-cyber-green" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                            ) : (
                                <svg className="w-6 h-6 text-cyber-green ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                            )}
                        </div>
                    </button>
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 border border-cyber-border bg-cyber-black/80 text-cyber-green text-[10px] font-mono">
                        {formatTime(displayTime)}
                    </div>
                    {/* Corner decorations */}
                    <div className="absolute top-1 left-1 w-4 h-4 border-t border-l border-cyber-green/20" />
                    <div className="absolute bottom-1 right-1 w-4 h-4 border-b border-r border-cyber-green/20" />
                </div>

                {/* Timeline */}
                <div className="p-4 sm:p-5 space-y-4">
                    <div ref={timelineRef}
                        className={`relative cursor-pointer select-none touch-none transition-all ${isDragging ? 'h-24 sm:h-28' : 'h-20 sm:h-24'}`}
                        onMouseDown={handleTimelineClick} onTouchStart={handleTimelineClick} id="trim-timeline">

                        {/* Track - improved visibility */}
                        <div className="absolute top-8 sm:top-9 left-0 right-0 h-8 sm:h-9 border-2 border-cyber-green/40" style={{ background: 'rgba(74, 246, 38, 0.03)' }} />
                        <div className="absolute top-8 sm:top-9 left-0 h-8 sm:h-9" style={{ width: `${startPct}%`, background: 'rgba(0, 0, 0, 0.7)' }} />
                        <div className="absolute top-8 sm:top-9 right-0 h-8 sm:h-9" style={{ width: `${100 - endPct}%`, background: 'rgba(0, 0, 0, 0.7)' }} />

                        {/* Selected */}
                        <div className="absolute top-8 sm:top-9 h-8 sm:h-9 border-y-2 transition-all"
                            style={{ left: `${startPct}%`, width: `${endPct - startPct}%`, borderColor: '#4AF626', background: 'rgba(74, 246, 38, 0.12)', boxShadow: '0 0 10px rgba(74, 246, 38, 0.15)' }} />

                        {/* Start handle */}
                        <div className="absolute top-0 z-20 flex flex-col items-center cursor-ew-resize"
                            style={{ left: `${startPct}%`, transform: 'translateX(-50%)' }}
                            onMouseDown={(e) => handleHandleDown(e, 'start')} onTouchStart={(e) => handleHandleDown(e, 'start')}>
                            <div className="w-12 h-14 sm:w-10 sm:h-12 flex items-center justify-center">
                                <div className={`flex flex-col items-center transition-all duration-150 ${isDragging === 'start' ? 'scale-125' : ''}`}>
                                    <div className="text-cyber-green text-[7px] leading-none mb-0.5">▼</div>
                                    <div className={`w-0.5 h-14 sm:h-16 transition-all duration-150 ${isDragging === 'start' ? 'bg-cyber-green shadow-[0_0_8px_rgba(74,246,38,0.6)] w-1' : 'bg-cyber-green/70'}`} />
                                    <div className="text-cyber-green text-[7px] leading-none mt-0.5">▲</div>
                                </div>
                            </div>
                            <span className={`text-[9px] font-mono font-bold mt-0.5 transition-all ${isDragging === 'start' ? 'text-cyber-green glow-green' : 'text-cyber-green/60'}`}>
                                {formatTime(startTime)}
                            </span>
                        </div>

                        {/* End handle */}
                        <div className="absolute top-0 z-20 flex flex-col items-center cursor-ew-resize"
                            style={{ left: `${endPct}%`, transform: 'translateX(-50%)' }}
                            onMouseDown={(e) => handleHandleDown(e, 'end')} onTouchStart={(e) => handleHandleDown(e, 'end')}>
                            <div className="w-12 h-14 sm:w-10 sm:h-12 flex items-center justify-center">
                                <div className={`flex flex-col items-center transition-all duration-150 ${isDragging === 'end' ? 'scale-125' : ''}`}>
                                    <div className="text-cyber-red text-[7px] leading-none mb-0.5">▼</div>
                                    <div className={`w-0.5 h-14 sm:h-16 transition-all duration-150 ${isDragging === 'end' ? 'bg-cyber-red shadow-[0_0_8px_rgba(255,42,42,0.6)] w-1' : 'bg-cyber-red/70'}`} />
                                    <div className="text-cyber-red text-[7px] leading-none mt-0.5">▲</div>
                                </div>
                            </div>
                            <span className={`text-[9px] font-mono font-bold mt-0.5 transition-all ${isDragging === 'end' ? 'text-cyber-red glow-red' : 'text-cyber-red/60'}`}>
                                {formatTime(endTime)}
                            </span>
                        </div>

                        {/* Playhead */}
                        <div ref={playheadRef} className="absolute top-7 sm:top-8 z-30 pointer-events-none" style={{ left: '0%' }}>
                            <div className="w-px h-10 sm:h-12 bg-cyber-blue/80 shadow-[0_0_4px_rgba(138,226,255,0.5)]" />
                            <div className="w-1.5 h-1.5 bg-cyber-blue -ml-[2.5px] -mt-0.5 shadow-[0_0_4px_rgba(138,226,255,0.5)]" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }} />
                        </div>
                    </div>

                    {isDragging && (
                        <div className="text-center text-[10px] text-cyber-blue/40 font-mono animate-flicker -mt-2">
                            &gt; {isDragging === 'start' ? '開始位置' : '終了位置'}を調整中...
                        </div>
                    )}

                    {/* Fine adjustment */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div className="flex items-center justify-center gap-1.5">
                            <span className="text-[9px] font-mono text-cyber-green/60 tracking-wider">開始</span>
                            <button onClick={() => { adjustTime('start', -0.5); seekTo(Math.max(0, startTime - 0.5)); }}
                                className="w-9 h-9 border border-cyber-border hover:border-cyber-green text-cyber-green text-sm flex items-center justify-center active:scale-90 transition-all">−</button>
                            <span className="text-[10px] font-mono text-cyber-green w-14 text-center">{formatTime(startTime)}</span>
                            <button onClick={() => { adjustTime('start', 0.5); seekTo(Math.min(startTime + 0.5, endTime - 0.3)); }}
                                className="w-9 h-9 border border-cyber-border hover:border-cyber-green text-cyber-green text-sm flex items-center justify-center active:scale-90 transition-all">+</button>
                        </div>
                        <div className="flex items-center justify-center gap-1.5">
                            <span className="text-[9px] font-mono text-cyber-red/60 tracking-wider">終了</span>
                            <button onClick={() => { adjustTime('end', -0.5); seekTo(Math.max(endTime - 0.5, startTime + 0.3)); }}
                                className="w-9 h-9 border border-cyber-border hover:border-cyber-red text-cyber-red text-sm flex items-center justify-center active:scale-90 transition-all">−</button>
                            <span className="text-[10px] font-mono text-cyber-red w-14 text-center">{formatTime(endTime)}</span>
                            <button onClick={() => { adjustTime('end', 0.5); seekTo(Math.min(duration, endTime + 0.5)); }}
                                className="w-9 h-9 border border-cyber-border hover:border-cyber-red text-cyber-red text-sm flex items-center justify-center active:scale-90 transition-all">+</button>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex items-center justify-between pt-3 border-t border-cyber-border/30">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyber-blue/40">
                            <span>選択範囲:</span>
                            <span className="text-cyber-green">{formatTime(selectedDuration)}</span>
                        </div>
                        <button onClick={playSelection}
                            className="flex items-center gap-1.5 text-[10px] font-heading tracking-wider text-cyber-blue hover:text-cyber-blue/80 active:scale-95 transition-all px-3 py-1.5 border border-cyber-border hover:border-cyber-blue"
                            id="trim-preview-btn">
                            <span className="text-[7px]">▶</span> プレビュー
                        </button>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={onBack} className="btn-secondary text-[10px]" id="trim-back-btn">
                    <span className="text-cyber-blue/40">&lt;</span> 戻る
                </button>
                <button onClick={() => onConfirm(videoFile, startTime, endTime)} className="btn-primary text-[10px] flex items-center justify-center gap-2" id="trim-confirm-btn">
                    <span className="text-[7px]">▶</span>
                    24フレームに分解する ({formatTime(selectedDuration)})
                </button>
            </div>
        </div>
    );
}
