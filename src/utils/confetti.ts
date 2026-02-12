import confetti from 'canvas-confetti';

/**
 * 觸發煙火般的慶祝特效 (Fireworks)
 * 適合用於中大獎時
 */
export const triggerFireworks = () => {
    const duration = 2000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#FFD700', '#FF69B4', '#00FFFF']
        });
        confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#FFD700', '#FF69B4', '#00FFFF']
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
};

/**
 * 觸發簡單的彩帶特效 (Simple Burst)
 * 適合用於一般中獎
 */
export const triggerConfetti = () => {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6C7BFF', '#4ADE80', '#FBBF24']
    });
};
