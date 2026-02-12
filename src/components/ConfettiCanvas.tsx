import { useEffect, useRef } from 'react';

/**
 * Canvas Confetti 特效元件
 *
 * 物理模擬：重力、摩擦力、初速度、旋轉
 * 效能優化：使用 requestAnimationFrame，自動清理
 */

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    rotation: number;
    rotationSpeed: number;
    size: number;
    alpha: number;
    decay: number;
}

const COLORS = ['#ff4757', '#2ed573', '#1e90ff', '#ffa502', '#ff6b81', '#7bed9f'];

export const ConfettiCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 設定全螢幕 Canvas
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // 初始化粒子
        const particles: Particle[] = [];
        const particleCount = 100;

        const createParticle = (): Particle => ({
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 20, // 爆發範圍
            vy: (Math.random() - 0.5) * 20 - 5, // 向上傾向
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10,
            size: Math.random() * 8 + 4,
            alpha: 1,
            decay: Math.random() * 0.015 + 0.005,
        });

        for (let i = 0; i < particleCount; i++) {
            particles.push(createParticle());
        }

        // 動畫迴圈
        let animationId: number;
        const loop = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            let activeCount = 0;

            particles.forEach((p) => {
                if (p.alpha <= 0) return;
                activeCount++;

                // 物理更新
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.3; // 重力
                p.vx *= 0.96; // 空氣阻力
                p.vy *= 0.96;
                p.rotation += p.rotationSpeed;
                p.alpha -= p.decay;

                // 繪製
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.alpha;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                ctx.restore();
            });

            if (activeCount > 0) {
                animationId = requestAnimationFrame(loop);
            }
        };

        loop();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                pointerEvents: 'none',
                zIndex: 99, // 在 ResultOverlay (100) 之下，但高於其他
            }}
        />
    );
};
