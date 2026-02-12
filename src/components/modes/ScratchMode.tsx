import { useRef, useState, useCallback } from 'react';
import { type DrawModeProps } from './WheelMode';
import { audio } from '../../utils/audio';

// Scratch brush size
const BRUSH_SIZE = 40;

export const ScratchMode: React.FC<DrawModeProps> = ({ items, onResult, onSpinningChange }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isScratching, setIsScratching] = useState(false);
    const [currentResult, setCurrentResult] = useState<string | null>(null);
    const [isRevealed, setIsRevealed] = useState(false);

    // Internal state for drawing
    const isDrawingRef = useRef(false);
    const lastPointRef = useRef<{ x: number; y: number } | null>(null);
    const lastAudioTimeRef = useRef(0);

    // Initialize canvas
    const initCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const { width, height } = container.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Fill with silver overlay
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(0, 0, width, height);

        // Add some noise/texture
        for (let i = 0; i < 5000; i++) {
            ctx.fillStyle = Math.random() > 0.5 ? '#E0E0E0' : '#A0A0A0';
            ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
        }

        // Add text "刮一刮"
        ctx.font = 'bold 24px sans-serif';
        ctx.fillStyle = '#666666';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('刮一刮', width / 2, height / 2);

        // Reset state
        // setProgress(0); (Removed)
        setIsRevealed(false);
        isDrawingRef.current = false;
    }, []);

    // Pick a result and start game
    const handleStart = () => {
        if (items.length === 0) return;

        // Randomly select result
        const randomIndex = Math.floor(Math.random() * items.length);
        setCurrentResult(items[randomIndex]);

        setIsScratching(true);
        onSpinningChange(true);

        // Initialize canvas after render
        setTimeout(initCanvas, 50);
    };

    const handleReveal = useCallback(() => {
        // Clear canvas completely
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }

        // Play win sound
        audio.win();

        // Call result after short delay
        setTimeout(() => {
            if (currentResult) {
                const index = items.indexOf(currentResult);
                onResult(currentResult, index);
                onSpinningChange(false);
                setIsScratching(false);
            }
        }, 1000);
    }, [currentResult, items, onResult, onSpinningChange]);

    // Calculate scratch progress
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const checkProgress = useCallback(throttle(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let transparentPixels = 0;

        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] < 128) {
                transparentPixels++;
            }
        }

        const totalPixels = pixels.length / 4;
        const currentProgress = transparentPixels / totalPixels;
        // setProgress(currentProgress); (Removed)

        if (currentProgress > 0.5 && !isRevealed) {
            setIsRevealed(true);
            handleReveal();
        }
    }, 500), [isRevealed, handleReveal]);

    const draw = (x: number, y: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = BRUSH_SIZE;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        if (lastPointRef.current) {
            ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
        } else {
            ctx.moveTo(x, y);
        }
        ctx.lineTo(x, y);
        ctx.stroke();

        lastPointRef.current = { x, y };

        // Play scratch sound (throttled)
        const now = Date.now();
        if (now - lastAudioTimeRef.current > 80) {
            audio.scratch();
            lastAudioTimeRef.current = now;
        }

        checkProgress();
    };

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        isDrawingRef.current = true;

        // Initialize AudioContext on first interaction
        audio.init();

        const { clientX, clientY } = 'touches' in e ? e.touches[0] : e;
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
            lastPointRef.current = { x: clientX - rect.left, y: clientY - rect.top };
            draw(clientX - rect.left, clientY - rect.top);
        }
    };

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawingRef.current) return;
        const { clientX, clientY } = 'touches' in e ? e.touches[0] : e;
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
            draw(clientX - rect.left, clientY - rect.top);
        }
        // Prevent scrolling on touch
        if ('touches' in e) e.preventDefault();
    };

    const handleMouseUp = () => {
        isDrawingRef.current = false;
        lastPointRef.current = null;
    };

    // Helper throttle
    function throttle(func: Function, limit: number) {
        let inThrottle: boolean;
        return function (this: any) {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    if (!isScratching) {
        return (
            <div className="scratch-start-container">
                <button
                    className="scratch-start-btn"
                    onClick={handleStart}
                    disabled={items.length === 0}
                >
                    領取刮刮卡
                </button>
            </div>
        );
    }

    return (
        <div className="scratch-card-container" ref={containerRef}>
            <div className="scratch-result-bg">
                <div className="scratch-result-text">{currentResult}</div>
            </div>
            <canvas
                ref={canvasRef}
                className="scratch-canvas"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleMouseDown}
                onTouchMove={handleMouseMove}
                onTouchEnd={handleMouseUp}
            />
        </div>
    );
};
