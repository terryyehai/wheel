import React, { useState, useEffect, useCallback } from 'react';
import { type DrawModeProps } from './WheelMode';
import { audio } from '../../utils/audio';
import { useHaptics } from '../../hooks/useHaptics';
import { triggerConfetti } from '../../utils/confetti';
import { useTranslation } from '../../i18n/LanguageContext';

export const CardMode: React.FC<DrawModeProps> = ({ items, onResult, onSpinningChange, spinFnRef }) => {
    const { t } = useTranslation();
    const [gameState, setGameState] = useState<'idle' | 'shuffling' | 'picking' | 'revealed'>('idle');
    const [shuffledCards, setShuffledCards] = useState<string[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const { triggerLight, triggerMedium, triggerHeavy } = useHaptics();

    const startShuffle = useCallback(() => {
        if (items.length === 0) return;
        setGameState('shuffling');
        onSpinningChange(true);
        setSelectedIndex(null);
        audio.shuffle();
        triggerMedium();
        setTimeout(() => {
            const newCards = [...items].sort(() => Math.random() - 0.5);
            setShuffledCards(newCards);
            setGameState('picking');
            onSpinningChange(false);
        }, 1200);
    }, [items, onSpinningChange, triggerMedium]);

    useEffect(() => {
        setShuffledCards([...items]);
    }, [items]);

    useEffect(() => {
        if (spinFnRef) {
            spinFnRef.current = startShuffle;
        }
    }, [spinFnRef, startShuffle]);

    const handleCardClick = (index: number) => {
        if (gameState !== 'picking') return;
        setSelectedIndex(index);
        setGameState('revealed');
        audio.flip();
        triggerLight();
        setTimeout(() => {
            const resultItem = shuffledCards[index];
            const originalIndex = items.indexOf(resultItem);
            onResult(resultItem, originalIndex);
            triggerConfetti();
            triggerHeavy();
        }, 800);
    };

    return (
        <div className="card-mode-container">
            {gameState === 'idle' ? (
                <div className="card-start-view">
                    <div className="card-preview-grid">
                        {items.slice(0, 3).map((_, i: number) => (
                            <div key={i} className="card-preview-item" style={{ transform: `rotate(${i * 10 - 10}deg)` }} />
                        ))}
                    </div>
                    <button className="card-start-btn" onClick={startShuffle}>
                        {t('modes.card.instruction')}
                    </button>
                </div>
            ) : (
                <div className={`card-grid ${gameState === 'shuffling' ? 'shuffling' : ''}`}>
                    {shuffledCards.map((item: string, index: number) => (
                        <div
                            key={index}
                            className={`card-wrapper ${index === selectedIndex ? 'flipped' : ''} ${gameState === 'revealed' && index !== selectedIndex ? 'dimmed' : ''}`}
                            onClick={() => handleCardClick(index)}
                            style={{ '--i': index } as React.CSSProperties}
                        >
                            <div className="card-inner">
                                <div className="card-front"><div className="card-pattern" /></div>
                                <div className="card-back"><span className="card-text">{item}</span></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {gameState === 'picking' && <div className="card-hint">{t('modes.card.choose')}</div>}
        </div>
    );
};
