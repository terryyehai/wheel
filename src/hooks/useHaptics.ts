import { useCallback } from 'react';

/**
 * Haptics Engine
 * 負責觸發裝置震動 (Navigator.vibrate) 與畫面震動 (Screen Shake CSS)
 */
export const useHaptics = () => {

    // 輕微震動 (用於按鈕點擊)
    const triggerLight = useCallback(() => {
        if (navigator.vibrate) navigator.vibrate(10);
    }, []);

    // 中等震動 (用於一般中獎)
    const triggerMedium = useCallback(() => {
        if (navigator.vibrate) navigator.vibrate(40);
        triggerScreenShake('soft');
    }, []);

    // 強烈震動 (用於大獎)
    const triggerHeavy = useCallback(() => {
        if (navigator.vibrate) navigator.vibrate([50, 20, 50, 20, 100]);
        triggerScreenShake('hard');
    }, []);

    // 觸發畫面震動 Class
    const triggerScreenShake = (intensity: 'soft' | 'hard') => {
        const app = document.querySelector('.app');
        if (app) {
            app.classList.remove('shake-soft', 'shake-hard');
            // Force reflow
            void (app as HTMLElement).offsetWidth;
            app.classList.add(intensity === 'soft' ? 'shake-soft' : 'shake-hard');

            setTimeout(() => {
                app.classList.remove('shake-soft', 'shake-hard');
            }, 500);
        }
    };

    return { triggerLight, triggerMedium, triggerHeavy };
};
