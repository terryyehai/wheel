import { useState, useEffect, useCallback } from 'react';
import { type DrawModeProps } from './WheelMode';
import { audio } from '../../utils/audio';

export const OmikujiMode: React.FC<DrawModeProps> = ({ items, onResult, onSpinningChange, spinFnRef }) => {
    const [isShaking, setIsShaking] = useState(false);
    const [stickResult, setStickResult] = useState<{ text: string, index: number } | null>(null);

    // 用於搖晃動畫的計數器
    // const shakeCount = useRef(0); (Removed)

    const startShake = useCallback(() => {
        if (items.length === 0) return;

        setIsShaking(true);
        onSpinningChange(true);
        setStickResult(null);

        // 播放搖籤聲 (loop)
        const shakeInterval = setInterval(() => {
            audio.shake();
        }, 150);

        // 搖晃 2 秒後出籤
        setTimeout(() => {
            clearInterval(shakeInterval);
            setIsShaking(false);

            // 隨機選籤
            const randomIndex = Math.floor(Math.random() * items.length);
            const resultText = items[randomIndex];

            setStickResult({ text: resultText, index: randomIndex });
            // audio.stickFall(); // Need to implement stick fall sound
            audio.thunk(); // Reuse thunk for now

            // 延遲顯示結果 Overlay
            setTimeout(() => {
                onResult(resultText, randomIndex);
                onSpinningChange(false);
            }, 1000);

        }, 2000);
    }, [items, onSpinningChange]);

    useEffect(() => {
        if (spinFnRef) {
            spinFnRef.current = startShake;
        }
    }, [spinFnRef, startShake]);

    return (
        <div className="omikuji-container">
            <div className={`omikuji-cylinder ${isShaking ? 'shaking' : ''}`} onClick={!isShaking ? startShake : undefined}>
                {/* 籤筒本體 SVG */}
                <svg viewBox="0 0 200 300" className="omikuji-svg">
                    <defs>
                        <linearGradient id="woodGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#8d6e63" />
                            <stop offset="50%" stopColor="#a1887f" />
                            <stop offset="100%" stopColor="#6d4c41" />
                        </linearGradient>
                        <filter id="shadow">
                            <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3" />
                        </filter>
                    </defs>

                    {/* 筒身 (六角柱) */}
                    <path d="M50 50 L150 50 L180 100 L180 250 L150 300 L50 300 L20 250 L20 100 Z"
                        fill="url(#woodGrad)" stroke="#5d4037" strokeWidth="2" filter="url(#shadow)" />

                    {/* 頂部開口 (黑色深淵) */}
                    <circle cx="100" cy="50" r="15" fill="#2d3436" />

                    {/* 裝飾文字 "御神籤" */}
                    <rect x="70" y="100" width="60" height="120" fill="#fff" opacity="0.9" rx="2" />
                    <text x="100" y="130" fontSize="24" textAnchor="middle" fill="#000" fontWeight="bold">御</text>
                    <text x="100" y="160" fontSize="24" textAnchor="middle" fill="#000" fontWeight="bold">神</text>
                    <text x="100" y="190" fontSize="24" textAnchor="middle" fill="#000" fontWeight="bold">籤</text>
                </svg>

                {/* 掉落的籤棒 */}
                {stickResult && (
                    <div className="omikuji-stick-container">
                        <div className="omikuji-stick">
                            <span className="stick-text">{stickResult.text.substring(0, 10)}</span>
                        </div>
                    </div>
                )}
            </div>

            {!isShaking && !stickResult && (
                <div className="omikuji-hint">點擊籤筒求籤</div>
            )}
        </div>
    );
};
