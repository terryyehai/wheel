import React, { useEffect, useCallback } from 'react';
import { ConfettiCanvas } from './ConfettiCanvas';
import { audio } from '../utils/audio';
import { useTranslation } from '../i18n/LanguageContext';

interface ResultOverlayProps {
    result: string;
    onClose: () => void;
    onSpinAgain?: () => void;
}

const SparkleIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
            fill="#6c7bff"
            stroke="#6c7bff"
            strokeWidth="0.5"
        />
        <path
            d="M19 15L19.75 17.25L22 18L19.75 18.75L19 21L18.25 18.75L16 18L18.25 17.25L19 15Z"
            fill="#a78bfa"
            opacity="0.7"
        />
        <path
            d="M5 2L5.5 3.5L7 4L5.5 4.5L5 6L4.5 4.5L3 4L4.5 3.5L5 2Z"
            fill="#a78bfa"
            opacity="0.5"
        />
    </svg>
);

export const ResultOverlay: React.FC<ResultOverlayProps> = ({
    result,
    onClose,
    onSpinAgain,
}) => {
    const { t } = useTranslation();

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        },
        [onClose]
    );

    useEffect(() => {
        document.body.classList.add('overlay-open');
        document.addEventListener('keydown', handleKeyDown);
        audio.win();
        return () => {
            document.body.classList.remove('overlay-open');
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    const handleSpinAgain = () => {
        audio.click();
        onClose();
        onSpinAgain?.();
    };

    return (
        <div
            className="result-overlay"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label={t('overlay.congrats')}
        >
            <ConfettiCanvas />

            <div className="result-card" onClick={(e) => e.stopPropagation()}>
                <div className="result-sparkle" aria-hidden="true">
                    <SparkleIcon />
                </div>

                <div className="result-label">{t('overlay.congrats')}</div>
                <div className="result-value" aria-live="assertive">{result}</div>

                <div className="result-actions">
                    {onSpinAgain && (
                        <button className="result-again-btn" onClick={handleSpinAgain}>
                            {t('overlay.spin_again')}
                        </button>
                    )}
                    <div className="result-hint">{t('overlay.close')}</div>
                </div>
            </div>
        </div>
    );
};
