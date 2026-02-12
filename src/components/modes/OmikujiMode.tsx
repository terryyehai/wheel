import React, { useState, useEffect, useCallback } from 'react';
import { type DrawModeProps } from './WheelMode';
import { audio } from '../../utils/audio';
import { useHaptics } from '../../hooks/useHaptics';
import { triggerConfetti } from '../../utils/confetti';
import { useTranslation } from '../../i18n/LanguageContext';

export const OmikujiMode: React.FC<DrawModeProps> = ({ items, onResult, onSpinningChange, spinFnRef }) => {
    const { t } = useTranslation();
    const [isShaking, setIsShaking] = useState(false);
    const [stickResult, setStickResult] = useState<{ text: string, index: number } | null>(null);

    const { triggerLight, triggerMedium, triggerHeavy } = useHaptics();

    const startShake = useCallback(() => {
        if (items.length === 0) return;
        setIsShaking(true);
        onSpinningChange(true);
        setStickResult(null);
        const shakeInterval = setInterval(() => {
            audio.shake();
            triggerLight();
        }, 150);
        setTimeout(() => {
            clearInterval(shakeInterval);
            setIsShaking(false);
            const randomIndex = Math.floor(Math.random() * items.length);
            const resultText = items[randomIndex];
            setStickResult({ text: resultText, index: randomIndex });
            audio.thunk();
            triggerMedium();
            setTimeout(() => {
                onResult(resultText, randomIndex);
                onSpinningChange(false);
                triggerConfetti();
                triggerHeavy();
            }, 1000);
        }, 2000);
    }, [items, onSpinningChange, triggerLight, triggerMedium, triggerHeavy]);

    useEffect(() => {
        if (spinFnRef) {
            spinFnRef.current = startShake;
        }
    }, [spinFnRef, startShake]);

    return (
        <div className="omikuji-container">
            <div className={`omikuji-cylinder ${isShaking ? 'shaking' : ''}`} onClick={!isShaking ? startShake : undefined}>
                <svg viewBox="0 0 200 300" className="omikuji-svg">
                    <defs>
                        <linearGradient id="woodGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#8d6e63" /><stop offset="50%" stopColor="#a1887f" /><stop offset="100%" stopColor="#6d4c41" />
                        </linearGradient>
                        <filter id="shadow"><feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3" /></filter>
                    </defs>
                    <path d="M50 50 L150 50 L180 100 L180 250 L150 300 L50 300 L20 250 L20 100 Z" fill="url(#woodGrad)" stroke="#5d4037" strokeWidth="2" filter="url(#shadow)" />
                    <circle cx="100" cy="50" r="15" fill="#2d3436" />
                    <rect x="70" y="100" width="60" height="120" fill="#fff" opacity="0.9" rx="2" />
                    <text x="100" y="130" fontSize="24" textAnchor="middle" fill="#000" fontWeight="bold">御</text>
                    <text x="100" y="160" fontSize="24" textAnchor="middle" fill="#000" fontWeight="bold">神</text>
                    <text x="100" y="190" fontSize="24" textAnchor="middle" fill="#000" fontWeight="bold">籤</text>
                </svg>
                {stickResult && (
                    <div className="omikuji-stick-container">
                        <div className="omikuji-stick"><span className="stick-text">{stickResult.text.substring(0, 10)}</span></div>
                    </div>
                )}
            </div>
            {!isShaking && !stickResult && (
                <div className="omikuji-hint">{t('modes.omikuji.instruction')}</div>
            )}
        </div>
    );
};
