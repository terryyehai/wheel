import React, { useState, useEffect, useCallback } from 'react';
import { type DrawModeProps } from './WheelMode';
import { audio } from '../../utils/audio';
import { useHaptics } from '../../hooks/useHaptics';
import { triggerConfetti } from '../../utils/confetti';
import { useTranslation } from '../../i18n/LanguageContext';

interface RedEnvelopeProps {
    isOpen: boolean;
    isHovered: boolean;
    onClick: () => void;
    onHover: (state: boolean) => void;
    content?: string;
    delay: number;
}

const RedEnvelopeItem: React.FC<RedEnvelopeProps> = ({ isOpen, isHovered, onClick, onHover, content, delay }) => {
    return (
        <div
            className={`red-envelope ${isOpen ? 'open' : ''} ${isHovered && !isOpen ? 'hover' : ''}`}
            onClick={onClick}
            onMouseEnter={() => onHover(true)}
            onMouseLeave={() => onHover(false)}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="envelope-body">
                <div className="envelope-flap"></div>
                <div className="envelope-decoration">福</div>
            </div>
            <div className="envelope-content">
                <div className="money-bg"></div>
                <div className="prize-text">{content}</div>
            </div>
        </div>
    );
};

export const RedEnvelopeMode: React.FC<DrawModeProps> = ({ items, onResult, onSpinningChange, spinFnRef }) => {
    const { t } = useTranslation();
    const [gameState, setGameState] = useState<'idle' | 'distributing' | 'picking' | 'opening'>('idle');
    const [envelopes, setEnvelopes] = useState<{ id: number; content: string }[]>([]);
    const [hoveredId, setHoveredId] = useState<number | null>(null);
    const [openedId, setOpenedId] = useState<number | null>(null);

    const { triggerLight, triggerMedium, triggerHeavy } = useHaptics();

    const distributeEnvelopes = useCallback(() => {
        if (items.length === 0) return;
        setGameState('distributing');
        onSpinningChange(true);
        setOpenedId(null);
        setHoveredId(null);
        const shuffledInfo = items.map((item, index) => ({ id: index, content: item }))
            .sort(() => Math.random() - 0.5);
        setEnvelopes(shuffledInfo);
        audio.shuffle();
        triggerMedium();
        setTimeout(() => {
            setGameState('picking');
            onSpinningChange(false);
        }, 1000);
    }, [items, onSpinningChange, triggerMedium]);

    useEffect(() => {
        distributeEnvelopes();
    }, [items]);

    useEffect(() => {
        if (spinFnRef) {
            spinFnRef.current = distributeEnvelopes;
        }
    }, [spinFnRef, distributeEnvelopes]);

    const handleEnvelopeClick = (id: number, content: string) => {
        if (gameState !== 'picking') return;
        setOpenedId(id);
        setGameState('opening');
        onSpinningChange(true);
        audio.shuffle();
        triggerLight();
        setTimeout(() => {
            audio.coin();
            triggerConfetti();
            triggerHeavy();
            const originalIndex = items.indexOf(content);
            onResult(content, originalIndex);
        }, 800);
    };

    return (
        <div className="red-envelope-container">
            <div className="envelope-grid">
                {envelopes.map((env, index) => (
                    <RedEnvelopeItem
                        key={env.id}
                        content={env.content}
                        isOpen={openedId === env.id}
                        isHovered={hoveredId === env.id}
                        onClick={() => handleEnvelopeClick(env.id, env.content)}
                        onHover={(state) => setHoveredId(state ? env.id : null)}
                        delay={index * 50}
                    />
                ))}
            </div>
            {gameState === 'picking' && (
                <div className="instruction-text">{t('modes.red-envelope.instruction')}</div>
            )}
        </div>
    );
};
