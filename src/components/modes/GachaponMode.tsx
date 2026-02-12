import React, { useState, useRef, useEffect, useCallback } from 'react';
import { type DrawModeProps } from './WheelMode';
import { audio } from '../../utils/audio';
import { generateColors } from '../../utils/colors';
import { useHaptics } from '../../hooks/useHaptics';
import { triggerConfetti } from '../../utils/confetti';
import { useTranslation } from '../../i18n/LanguageContext';

export const GachaponMode: React.FC<DrawModeProps> = ({ items, onResult, onSpinningChange, spinFnRef }) => {
    const { t } = useTranslation();
    const [isAnimating, setIsAnimating] = useState(false);
    const [ballState, setBallState] = useState<'idle' | 'dropping' | 'open' | 'opened'>('idle');
    const [resultItem, setResultItem] = useState<string | null>(null);
    const [knobRotation, setKnobRotation] = useState(0);

    const colors = useRef(generateColors(Math.max(items.length, 10)));
    const [resultColor, setResultColor] = useState<{ bg: string, text: string }>({ bg: '#FF6B6B', text: '#FFF' });

    const { triggerLight, triggerMedium, triggerHeavy } = useHaptics();

    const handleCrank = useCallback(() => {
        if (items.length === 0) return;
        setIsAnimating(true);
        onSpinningChange(true);
        setBallState('idle');
        setKnobRotation((prev) => prev + 360);
        audio.crank();
        triggerLight();

        setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * items.length);
            setResultItem(items[randomIndex]);
            setResultColor(colors.current[Math.floor(Math.random() * colors.current.length)]);
            setBallState('dropping');
            audio.thunk();
            triggerMedium();
        }, 1000);
    }, [items, onSpinningChange, triggerLight, triggerMedium]);

    useEffect(() => {
        if (spinFnRef) {
            spinFnRef.current = handleCrank;
        }
    }, [handleCrank, spinFnRef]);

    const handleOpenBall = () => {
        if (ballState !== 'dropping') return;
        setBallState('open');
        audio.pop();
        setTimeout(() => {
            if (resultItem) {
                const index = items.indexOf(resultItem);
                onResult(resultItem, index);
                setBallState('opened');
                triggerConfetti();
                triggerHeavy();
                setIsAnimating(false);
                onSpinningChange(false);
            }
        }, 600);
    };

    return (
        <div className="gachapon-container">
            <div className="gachapon-machine">
                <svg viewBox="0 0 300 450" className="gachapon-svg">
                    <defs>
                        <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ff7675" />
                            <stop offset="100%" stopColor="#d63031" />
                        </linearGradient>
                        <linearGradient id="glassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
                            <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
                        </linearGradient>
                    </defs>
                    <path d="M50 80 Q150 20 250 80 L250 120 L50 120 Z" fill="url(#bodyGrad)" stroke="#b33939" strokeWidth="2" />
                    <rect x="55" y="120" width="190" height="180" fill="rgba(255,255,255,0.05)" />
                    <g className="gachapon-balls-inside">
                        <circle cx="100" cy="260" r="18" fill="#fab1a0" />
                        <circle cx="140" cy="270" r="18" fill="#fdcb6e" />
                        <circle cx="180" cy="260" r="18" fill="#55efc4" />
                        <circle cx="210" cy="230" r="18" fill="#74b9ff" />
                        <circle cx="120" cy="230" r="18" fill="#a29bfe" />
                        <circle cx="160" cy="200" r="18" fill="#ff7675" />
                    </g>
                    <rect x="50" y="120" width="200" height="180" rx="4" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
                    <path d="M60 130 L80 130 Q70 200 60 280" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" strokeLinecap="round" />
                    <path d="M40 300 L260 300 L260 420 Q150 440 40 420 Z" fill="url(#bodyGrad)" stroke="#b33939" strokeWidth="2" />
                    <rect x="100" y="360" width="100" height="50" rx="10" fill="#2d3436" stroke="#636e72" strokeWidth="2" />
                    <rect x="105" y="365" width="90" height="40" rx="5" fill="#000" />
                </svg>

                <div
                    className="gachapon-knob-container"
                    onClick={!isAnimating ? handleCrank : undefined}
                    role="button"
                    aria-label={t('modes.gachapon.name')}
                    style={{ cursor: isAnimating ? 'default' : 'pointer' }}
                >
                    <div className="gachapon-knob" style={{ transform: `rotate(${knobRotation}deg)` }}>
                        <div className="knob-bar"></div>
                        <div className="knob-center"></div>
                    </div>
                </div>

                {(ballState === 'dropping' || ballState === 'open' || ballState === 'opened') && (
                    <div
                        className={`gachapon-ball ${ballState}`}
                        style={{ '--ball-color': resultColor.bg } as React.CSSProperties}
                        onClick={handleOpenBall}
                    >
                        <div className="ball-half ball-upper" />
                        <div className="ball-center-ring" />
                        <div className="ball-half ball-lower" />
                    </div>
                )}

                {!isAnimating && (
                    <div className="gachapon-hint-text">{t('modes.gachapon.instruction')}</div>
                )}
            </div>
        </div>
    );
};
