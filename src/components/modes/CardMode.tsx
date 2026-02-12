import { useState, useEffect, useCallback } from 'react';
import { type DrawModeProps } from './WheelMode';
import { audio } from '../../utils/audio';

export const CardMode: React.FC<DrawModeProps> = ({ items, onResult, onSpinningChange, spinFnRef }) => {
    const [gameState, setGameState] = useState<'idle' | 'shuffling' | 'picking' | 'revealed'>('idle');
    const [shuffledCards, setShuffledCards] = useState<string[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    // Shuffle cards logic
    const startShuffle = useCallback(() => {
        if (items.length === 0) return;

        setGameState('shuffling');
        onSpinningChange(true);
        setSelectedIndex(null);

        // Audio: Shuffle sound
        audio.shuffle();

        // Animation duration for shuffle
        setTimeout(() => {
            // Create a shuffled array of items
            // If items < 6, duplicate them to fill a nice grid? Or just use items.
            // Requirement says "Draw Card", usually implies picking one from options.
            // Let's just shuffle the items provided.
            const newCards = [...items].sort(() => Math.random() - 0.5);
            setShuffledCards(newCards);
            setGameState('picking');
            onSpinningChange(false); // Enable picking
        }, 1200);
    }, [items, onSpinningChange]);

    // Initial shuffle when mounting or items change
    useEffect(() => {
        setShuffledCards([...items]);
        // Auto start shuffle if just entered? Maybe user should click "Start"?
        // Let's have a "Wash Cards" (洗牌) button initially.
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

        // Show result after flip animation
        setTimeout(() => {
            const resultItem = shuffledCards[index];
            const originalIndex = items.indexOf(resultItem);
            onResult(resultItem, originalIndex);
        }, 800);
    };

    return (
        <div className="card-mode-container">
            {gameState === 'idle' ? (
                <div className="card-start-view">
                    <div className="card-preview-grid">
                        {items.slice(0, 3).map((_, i) => (
                            <div key={i} className="card-preview-item" style={{ transform: `rotate(${i * 10 - 10}deg)` }} />
                        ))}
                    </div>
                    <button className="card-start-btn" onClick={startShuffle}>
                        開始洗牌
                    </button>
                </div>
            ) : (
                <div className={`card-grid ${gameState === 'shuffling' ? 'shuffling' : ''}`}>
                    {shuffledCards.map((item, index) => (
                        <div
                            key={index}
                            className={`card-wrapper ${index === selectedIndex ? 'flipped' : ''} ${gameState === 'revealed' && index !== selectedIndex ? 'dimmed' : ''}`}
                            onClick={() => handleCardClick(index)}
                            style={{ '--i': index } as React.CSSProperties}
                        >
                            <div className="card-inner">
                                <div className="card-front">
                                    <div className="card-pattern" />
                                </div>
                                <div className="card-back">
                                    <span className="card-text">{item}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {gameState === 'picking' && (
                <div className="card-hint">
                    請憑直覺選一張牌
                </div>
            )}
        </div>
    );
};
