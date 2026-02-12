import React, { useRef, useEffect, useCallback, useState, type MutableRefObject } from 'react';
import { generateColors } from '../../utils/colors';
import { useWheelAnimation, getSliceAtPointer } from '../../hooks/useWheelAnimation';
import { audio } from '../../utils/audio';
import { useHaptics } from '../../hooks/useHaptics';
import { triggerConfetti } from '../../utils/confetti';
import { useTranslation } from '../../i18n/LanguageContext';

export interface DrawModeProps {
    items: string[];
    onResult: (item: string, index: number) => void;
    onSpinningChange: (spinning: boolean) => void;
    spinFnRef?: MutableRefObject<(() => void) | null>;
}

const DPR = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 3) : 2;

export const WheelMode: React.FC<DrawModeProps> = ({ items, onResult, onSpinningChange, spinFnRef }) => {
    const { t } = useTranslation();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const pointerRef = useRef<HTMLDivElement>(null);
    const [canvasSize, setCanvasSize] = useState(320);
    const currentAngleRef = useRef(0);
    const lastSliceIndexRef = useRef(-1);

    const { triggerLight, triggerMedium } = useHaptics();

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

    const drawWheel = useCallback(
        (rotationAngle: number) => {
            const canvas = canvasRef.current;
            if (!canvas || items.length < 2) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const size = canvasSize;
            const center = size / 2;
            const radius = center - 8;
            const sliceAngle = (2 * Math.PI) / items.length;
            const colors = generateColors(items.length);

            canvas.width = size * DPR;
            canvas.height = size * DPR;
            canvas.style.width = `${size}px`;
            canvas.style.height = `${size}px`;
            ctx.scale(DPR, DPR);

            ctx.clearRect(0, 0, size, size);

            ctx.save();
            ctx.beginPath();
            ctx.arc(center, center, center - 2, 0, 2 * Math.PI);
            ctx.fillStyle = '#1a1d2e';
            ctx.shadowColor = 'rgba(108, 123, 255, 0.12)';
            ctx.shadowBlur = 30;
            ctx.fill();
            ctx.restore();

            const rotationRad = (rotationAngle * Math.PI) / 180;

            items.forEach((item, i) => {
                const startAngle = sliceAngle * i + rotationRad - Math.PI / 2;
                const endAngle = startAngle + sliceAngle;

                ctx.beginPath();
                ctx.moveTo(center, center);
                ctx.arc(center, center, radius, startAngle, endAngle);
                ctx.closePath();
                ctx.fillStyle = colors[i].bg;
                ctx.fill();

                ctx.strokeStyle = 'rgba(255,255,255,0.08)';
                ctx.lineWidth = 1;
                ctx.stroke();

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

            // Ticks
            const tickOuterRadius = center - 2;
            const tickInnerRadiusMajor = radius + 1;
            const tickInnerRadiusMinor = radius + 3;
            const totalTicks = Math.max(items.length * 4, 36);

            for (let i = 0; i < totalTicks; i++) {
                const angle = (i / totalTicks) * Math.PI * 2 - Math.PI / 2;
                const isMajor = i % 4 === 0;
                const innerR = isMajor ? tickInnerRadiusMajor : tickInnerRadiusMinor;

                ctx.beginPath();
                ctx.moveTo(center + Math.cos(angle) * innerR, center + Math.sin(angle) * innerR);
                ctx.lineTo(center + Math.cos(angle) * tickOuterRadius, center + Math.sin(angle) * tickOuterRadius);
                ctx.strokeStyle = isMajor ? 'rgba(108, 123, 255, 0.35)' : 'rgba(255, 255, 255, 0.1)';
                ctx.lineWidth = isMajor ? 1.5 : 0.5;
                ctx.stroke();
            }

            // Center
            const innerRadius = radius * 0.18;
            const gradient = ctx.createRadialGradient(center, center, 0, center, center, innerRadius);
            gradient.addColorStop(0, '#2a2f4a');
            gradient.addColorStop(1, '#1a1d2e');

            ctx.beginPath();
            ctx.arc(center, center, innerRadius, 0, 2 * Math.PI);
            ctx.fillStyle = gradient;
            ctx.fill();
            ctx.strokeStyle = 'rgba(108, 123, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(center, center, radius, 0, 2 * Math.PI);
            ctx.strokeStyle = 'rgba(108, 123, 255, 0.15)';
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(center, center, center - 2, 0, 2 * Math.PI);
            ctx.strokeStyle = 'rgba(108, 123, 255, 0.2)';
            ctx.lineWidth = 2;
            ctx.stroke();
        },
        [items, canvasSize]
    );

    useEffect(() => {
        drawWheel(currentAngleRef.current);
    }, [drawWheel]);

    const { startSpin, isSpinning } = useWheelAnimation({
        itemCount: items.length,
        onAngleUpdate: (angle) => {
            currentAngleRef.current = angle;
            drawWheel(angle);
            const currentSlice = getSliceAtPointer(angle, items.length);
            if (currentSlice !== lastSliceIndexRef.current && lastSliceIndexRef.current !== -1) {
                audio.tick();
                triggerLight();
                if (pointerRef.current) {
                    pointerRef.current.classList.remove('pointer-ticking');
                    void pointerRef.current.offsetWidth;
                    pointerRef.current.classList.add('pointer-ticking');
                }
            }
            lastSliceIndexRef.current = currentSlice;
        },
        onComplete: (finalAngle) => {
            currentAngleRef.current = finalAngle;
            drawWheel(finalAngle);
            const resultIndex = getSliceAtPointer(finalAngle, items.length);
            onSpinningChange(false);
            onResult(items[resultIndex], resultIndex);
            triggerConfetti();
            triggerMedium();
            lastSliceIndexRef.current = -1;
        },
    });

    const handleSpin = () => {
        if (isSpinning || items.length < 2) return;
        audio.init();
        audio.click();
        triggerLight();
        onSpinningChange(true);
        startSpin();
    };

    useEffect(() => {
        if (spinFnRef) {
            spinFnRef.current = handleSpin;
        }
    });

    return (
        <div className={`wheel-container ${isSpinning ? 'wheel-glow' : ''}`} ref={containerRef}>
            <div className="wheel-pointer" ref={pointerRef} aria-hidden="true">
                <svg width="28" height="36" viewBox="0 0 28 36">
                    <path d="M14 36L2 8C0.5 4.5 3 0 7 0H21C25 0 27.5 4.5 26 8L14 36Z" fill="#6c7bff" />
                </svg>
            </div>
            <canvas
                ref={canvasRef}
                className="wheel-canvas"
                style={{ width: canvasSize, height: canvasSize }}
                role="img"
                aria-label={`${t('modes.wheel.name')}, ${items.length} ${t('input.items_count')}`}
            />
            <button
                className={`wheel-center-btn ${isSpinning ? 'spinning' : ''}`}
                onClick={handleSpin}
                disabled={isSpinning || items.length < 2}
                aria-label={isSpinning ? t('input.spinning_hint') : t('modes.wheel.spin')}
            >
                {isSpinning ? (
                    <span className="btn-spinner" aria-hidden="true" />
                ) : (
                    t('modes.wheel.spin').slice(0, 2)
                )}
            </button>
        </div>
    );
};
