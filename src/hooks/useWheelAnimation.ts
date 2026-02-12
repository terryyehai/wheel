import { useRef, useCallback, useState } from 'react';
import { threePhaseEasing } from '../utils/easing';

/**
 * 三段式轉盤動畫引擎
 *
 * 核心設計：
 * 1. 結果在動畫開始前即決定（公平性）
 * 2. 動畫純粹為「演出」，使用 requestAnimationFrame 驅動
 * 3. 三段式節奏：高速 → 減速咪牌 → 停止回彈
 * 4. 動畫結束時強制設定精確最終角度（消除誤差）
 * 5. 尊重 prefers-reduced-motion（UX #9）
 */

/** 動畫總時長 (ms) */
const TOTAL_DURATION = 4500;
/** 基礎旋轉圈數（確保視覺上足夠多圈） */
const BASE_ROTATIONS = 8;

/**
 * 偵測用戶是否偏好減少動態效果
 */
const prefersReducedMotion = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * 計算最終停止角度
 *
 * 確保指定的 resultIndex 停在 12 點鐘指針位置。
 * 轉盤是「順時針旋轉」，即 rotationAngle 越大，slice 越往順時針走。
 * 指針固定在上方（-90°），slice i 的中心 = sliceAngle * i + sliceAngle/2。
 * 要讓 slice i 停在指針下方，最終旋轉角度 = 360 - (sliceAngle * i + sliceAngle/2)。
 */
const computeFinalAngle = (resultIndex: number, itemCount: number): number => {
    const sliceAngle = 360 / itemCount;
    // slice 中心角 + 隨機偏移（停在 slice 中間附近，不碰邊線）
    const randomOffset = (Math.random() - 0.5) * sliceAngle * 0.5;
    const sliceCenter = sliceAngle * resultIndex + sliceAngle / 2;
    return (360 - sliceCenter + randomOffset + 360) % 360;
};

interface UseWheelAnimationParams {
    /** 項目總數 */
    itemCount: number;
    /** 動畫進行中的角度更新回呼 */
    onAngleUpdate: (angle: number) => void;
    /** 動畫完成回呼，帶抽中的 index 和最終角度 */
    onComplete: (resultIndex: number, finalAngle: number) => void;
}

interface UseWheelAnimationReturn {
    /** 觸發一次抽獎旋轉 */
    startSpin: () => void;
    /** 是否正在旋轉中 */
    isSpinning: boolean;
}

export const useWheelAnimation = ({
    itemCount,
    onAngleUpdate,
    onComplete,
}: UseWheelAnimationParams): UseWheelAnimationReturn => {
    const [isSpinning, setIsSpinning] = useState(false);
    const animFrameRef = useRef<number>(0);
    const startTimeRef = useRef<number>(0);

    const startSpin = useCallback(() => {
        if (isSpinning || itemCount < 2) return;

        setIsSpinning(true);

        // ── 1. 結果預先決定 ──
        const resultIndex = Math.floor(Math.random() * itemCount);
        const finalAngle = computeFinalAngle(resultIndex, itemCount);

        // ── prefers-reduced-motion: 跳過動畫直接出結果 (UX #9) ──
        if (prefersReducedMotion()) {
            onAngleUpdate(finalAngle);
            setTimeout(() => {
                setIsSpinning(false);
                onComplete(resultIndex, finalAngle);
            }, 100);
            return;
        }

        // 總旋轉角度 = 基礎圈數 + 最終角度
        const totalAngle = 360 * BASE_ROTATIONS + finalAngle;

        // ── 2. 動畫迴圈 ──
        const animate = (timestamp: number) => {
            if (!startTimeRef.current) {
                startTimeRef.current = timestamp;
            }

            const elapsed = timestamp - startTimeRef.current;
            const progress = Math.min(elapsed / TOTAL_DURATION, 1);

            if (progress < 1) {
                // 動畫進行中：使用三段式 easing 計算當前角度
                const easedProgress = threePhaseEasing(progress);
                const currentAngle = easedProgress * totalAngle;
                onAngleUpdate(((currentAngle % 360) + 360) % 360);
                animFrameRef.current = requestAnimationFrame(animate);
            } else {
                // ── 3. 動畫結束：強制設定精確最終角度 ──
                //    這是關鍵！不依賴 easing 的浮點精度，
                //    直接用預先計算好的 finalAngle，確保指針位置與結果完全一致。
                onAngleUpdate(finalAngle);
                startTimeRef.current = 0;
                setIsSpinning(false);
                onComplete(resultIndex, finalAngle);
            }
        };

        startTimeRef.current = 0;
        animFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current);
            }
        };
    }, [isSpinning, itemCount, onAngleUpdate, onComplete]);

    return { startSpin, isSpinning };
};
