import { useEffect, useCallback } from 'react';
import { ConfettiCanvas } from './ConfettiCanvas';
import { audio } from '../utils/audio';

/**
 * 結果彈出層
 *
 * 全螢幕半透明遮罩 + 背景模糊，中央卡片彈出動畫。
 * 符合 ARIA dialog 規範：role="dialog" + aria-modal + ESC 關閉。
 * 包含 canvas confetti 粒子效果與「再抽一次」按鈕。
 */

interface ResultOverlayProps {
    /** 抽中的項目名稱 */
    result: string;
    /** 關閉回呼 */
    onClose: () => void;
    /** 再抽一次回呼 */
    onSpinAgain?: () => void;
}

/** Sparkle 圖示 — SVG 取代 emoji (UX: no-emoji-icons) */
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
    // ESC 鍵關閉 (UX #41: keyboard navigation)
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        },
        [onClose]
    );

    // 掛載時鎖定 body 滾動 & 監聽鍵盤 & 播放勝利音效
    useEffect(() => {
        document.body.classList.add('overlay-open');
        document.addEventListener('keydown', handleKeyDown);

        // 播放勝利音效
        audio.win();

        return () => {
            document.body.classList.remove('overlay-open');
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    const handleSpinAgain = () => {
        // 點擊音效
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
            aria-label="抽獎結果"
        >
            {/* Canvas Confetti 粒子效果 (全螢幕層) */}
            <ConfettiCanvas />

            <div className="result-card" onClick={(e) => e.stopPropagation()}>
                {/* 裝飾背景光暈 */}
                <div className="result-sparkle" aria-hidden="true">
                    <SparkleIcon />
                </div>

                <div className="result-label">恭喜抽中</div>
                <div className="result-value" aria-live="assertive">{result}</div>

                <div className="result-actions">
                    {onSpinAgain && (
                        <button className="result-again-btn" onClick={handleSpinAgain}>
                            再抽一次
                        </button>
                    )}
                    <div className="result-hint">點擊背景或按 ESC 關閉</div>
                </div>
            </div>
        </div>
    );
};
