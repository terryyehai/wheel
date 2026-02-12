import { useRef, useEffect, useCallback, useState, type MutableRefObject } from 'react';
import { generateColors } from '../utils/colors';
import { useWheelAnimation, getSliceAtPointer } from '../hooks/useWheelAnimation';
import { audio } from '../utils/audio';

/**
 * Canvas 大轉盤元件
 *
 * 使用 Canvas 繪製等角度分割的圓盤，
 * 固定指針在 12 點鐘方向，中央「開始抽獎」按鈕。
 * 文字沿圓弧中心旋轉繪製。
 * 外環含刻度標記增加精密感。
 */

interface WheelProps {
    /** 抽獎項目列表 */
    items: string[];
    /** 抽獎結果回呼 */
    onResult: (item: string, index: number) => void;
    /** 旋轉狀態變化回呼 */
    onSpinningChange: (spinning: boolean) => void;
    /** 暴露 spin 函數給外部（用於「再抽一次」） */
    spinFnRef?: MutableRefObject<(() => void) | null>;
}

/** Canvas 解析度倍率（for Retina） */
const DPR = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 3) : 2;

export const Wheel: React.FC<WheelProps> = ({ items, onResult, onSpinningChange, spinFnRef }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const pointerRef = useRef<HTMLDivElement>(null);
    const [canvasSize, setCanvasSize] = useState(320);
    const currentAngleRef = useRef(0);
    const lastSliceIndexRef = useRef(-1);

    // ── Canvas 尺寸自適應 ──
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const width = Math.min(containerRef.current.clientWidth - 32, 400);
                setCanvasSize(width);
            }
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // ── 繪製轉盤 ──
    const drawWheel = useCallback(
        (rotationAngle: number) => {
            const canvas = canvasRef.current;
            if (!canvas || items.length < 2) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const size = canvasSize;
            const center = size / 2;
            const radius = center - 8; // 留空間給外環刻度
            const sliceAngle = (2 * Math.PI) / items.length;
            const colors = generateColors(items.length);

            // 設定 Retina 解析度
            canvas.width = size * DPR;
            canvas.height = size * DPR;
            canvas.style.width = `${size}px`;
            canvas.style.height = `${size}px`;
            ctx.scale(DPR, DPR);

            // 清空
            ctx.clearRect(0, 0, size, size);

            // 外圈裝飾環底色
            ctx.save();
            ctx.beginPath();
            ctx.arc(center, center, center - 2, 0, 2 * Math.PI);
            ctx.fillStyle = '#1a1d2e';
            ctx.shadowColor = 'rgba(108, 123, 255, 0.12)';
            ctx.shadowBlur = 30;
            ctx.fill();
            ctx.restore();

            // 旋轉偏移（將角度轉為弧度）
            const rotationRad = (rotationAngle * Math.PI) / 180;

            // 繪製每個 slice
            items.forEach((item, i) => {
                const startAngle = sliceAngle * i + rotationRad - Math.PI / 2;
                const endAngle = startAngle + sliceAngle;

                // 扇形
                ctx.beginPath();
                ctx.moveTo(center, center);
                ctx.arc(center, center, radius, startAngle, endAngle);
                ctx.closePath();
                ctx.fillStyle = colors[i].bg;
                ctx.fill();

                // 分隔線
                ctx.strokeStyle = 'rgba(255,255,255,0.08)';
                ctx.lineWidth = 1;
                ctx.stroke();

                // 文字
                ctx.save();
                ctx.translate(center, center);
                ctx.rotate(startAngle + sliceAngle / 2);

                const textRadius = radius * 0.62;
                const maxTextWidth = radius * 0.45;
                const fontSize = Math.max(10, Math.min(14, (canvasSize / items.length) * 0.8));

                ctx.font = `500 ${fontSize}px "Inter", "Noto Sans TC", sans-serif`;
                ctx.fillStyle = colors[i].text;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // 文字截斷
                let displayText = item;
                while (ctx.measureText(displayText).width > maxTextWidth && displayText.length > 1) {
                    displayText = displayText.slice(0, -1);
                }
                if (displayText !== item) {
                    displayText += '…';
                }

                ctx.fillText(displayText, textRadius, 0);
                ctx.restore();
            });

            // ── 外環刻度標記（錶盤感） ──
            const tickOuterRadius = center - 2;
            const tickInnerRadiusMajor = radius + 1;
            const tickInnerRadiusMinor = radius + 3;
            const totalTicks = Math.max(items.length * 4, 36);

            for (let i = 0; i < totalTicks; i++) {
                const angle = (i / totalTicks) * Math.PI * 2 - Math.PI / 2;
                const isMajor = i % 4 === 0;
                const innerR = isMajor ? tickInnerRadiusMajor : tickInnerRadiusMinor;

                ctx.beginPath();
                ctx.moveTo(
                    center + Math.cos(angle) * innerR,
                    center + Math.sin(angle) * innerR
                );
                ctx.lineTo(
                    center + Math.cos(angle) * tickOuterRadius,
                    center + Math.sin(angle) * tickOuterRadius
                );
                ctx.strokeStyle = isMajor
                    ? 'rgba(108, 123, 255, 0.35)'
                    : 'rgba(255, 255, 255, 0.1)';
                ctx.lineWidth = isMajor ? 1.5 : 0.5;
                ctx.stroke();
            }

            // 中心圓
            const innerRadius = radius * 0.18;
            const gradient = ctx.createRadialGradient(
                center, center, 0,
                center, center, innerRadius
            );
            gradient.addColorStop(0, '#2a2f4a');
            gradient.addColorStop(1, '#1a1d2e');

            ctx.beginPath();
            ctx.arc(center, center, innerRadius, 0, 2 * Math.PI);
            ctx.fillStyle = gradient;
            ctx.fill();
            ctx.strokeStyle = 'rgba(108, 123, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // 外環描邊
            ctx.beginPath();
            ctx.arc(center, center, radius, 0, 2 * Math.PI);
            ctx.strokeStyle = 'rgba(108, 123, 255, 0.15)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // 最外層環
            ctx.beginPath();
            ctx.arc(center, center, center - 2, 0, 2 * Math.PI);
            ctx.strokeStyle = 'rgba(108, 123, 255, 0.2)';
            ctx.lineWidth = 2;
            ctx.stroke();
        },
        [items, canvasSize]
    );

    // ── 初始繪製 & 項目變更時重繪 ──
    useEffect(() => {
        drawWheel(currentAngleRef.current);
    }, [drawWheel]);

    // ── 動畫引擎 ──
    const { startSpin, isSpinning } = useWheelAnimation({
        itemCount: items.length,
        onAngleUpdate: (angle) => {
            currentAngleRef.current = angle;
            drawWheel(angle);

            // ── 聲光效果：偵測指針跨區 ──
            const currentSlice = getSliceAtPointer(angle, items.length);
            if (currentSlice !== lastSliceIndexRef.current && lastSliceIndexRef.current !== -1) {
                // 播放音效
                audio.tick();
                // 觸發指針動畫（移除 class 再加回以重播動畫）
                if (pointerRef.current) {
                    pointerRef.current.classList.remove('pointer-ticking');
                    void pointerRef.current.offsetWidth; // Force reflow
                    pointerRef.current.classList.add('pointer-ticking');
                }
            }
            lastSliceIndexRef.current = currentSlice;
        },
        onComplete: (finalAngle) => {
            // 「先停再讀」：根據停輪角度反查指針指向的 slice
            currentAngleRef.current = finalAngle;
            drawWheel(finalAngle);
            const resultIndex = getSliceAtPointer(finalAngle, items.length);
            onSpinningChange(false);
            onResult(items[resultIndex], resultIndex);

            // 轉完重置 slice index，避免下次開始時瞬間觸發音效
            lastSliceIndexRef.current = -1;
        },
    });

    const handleSpin = () => {
        if (isSpinning || items.length < 2) return;

        // 使用者互動時初始化 AudioContext
        audio.init();
        audio.click();

        onSpinningChange(true);
        startSpin();
    };

    // 暴露 handleSpin 給外部（「再抽一次」功能）
    useEffect(() => {
        if (spinFnRef) {
            spinFnRef.current = handleSpin;
        }
    });

    return (
        <div
            className={`wheel-container ${isSpinning ? 'wheel-glow' : ''}`}
            ref={containerRef}
        >
            {/* 固定指針 — 12 點鐘方向 */}
            <div className="wheel-pointer" ref={pointerRef} aria-hidden="true">
                <svg width="28" height="36" viewBox="0 0 28 36">
                    <path
                        d="M14 36L2 8C0.5 4.5 3 0 7 0H21C25 0 27.5 4.5 26 8L14 36Z"
                        fill="#6c7bff"
                        filter="drop-shadow(0 2px 6px rgba(108,123,255,0.5))"
                    />
                </svg>
            </div>

            {/* Canvas 轉盤 */}
            <canvas
                ref={canvasRef}
                className="wheel-canvas"
                style={{ width: canvasSize, height: canvasSize }}
                role="img"
                aria-label={`抽獎轉盤，共 ${items.length} 個選項`}
            />

            {/* 中央按鈕 (UX #40: aria-label for icon-only states) */}
            <button
                className={`wheel-center-btn ${isSpinning ? 'spinning' : ''}`}
                onClick={handleSpin}
                disabled={isSpinning || items.length < 2}
                aria-label={isSpinning ? '抽獎進行中' : '開始抽獎'}
            >
                {isSpinning ? (
                    <span className="btn-spinner" aria-hidden="true" />
                ) : (
                    '開始'
                )}
            </button>
        </div>
    );
};
