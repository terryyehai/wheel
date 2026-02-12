import { useRef, useCallback, useState } from 'react';
import { threePhaseEasing } from '../utils/easing';

/**
 * 三段式轉盤動畫引擎 v4 — 「先停再讀」架構
 *
 * 與之前版本的核心差異：
 * 之前：先決定結果 → 計算角度 → 動畫到角度 → 顯示結果（角度公式一旦錯就不一致）
 * 現在：先決定停止角度 → 動畫到角度 → 讀取指針位置的 slice → 顯示結果
 *
 * 這樣不管公式怎麼寫，結果永遠 = 用戶看到的位置。
 */

/** 動畫總時長 (ms) */
const TOTAL_DURATION = 4500;
/** 基礎旋轉圈數 */
const BASE_ROTATIONS = 8;

/**
 * 偵測用戶是否偏好減少動態效果
 */
const prefersReducedMotion = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * 根據旋轉角度，計算 12 點鐘指針指向的是第幾個 slice
 *
 * 繪製公式：slice i 的起始角 = (2π/n)*i + rotationRad - π/2
 * 指針位於 -π/2（頂部），要找滿足以下條件的 i：
 *   (2π/n)*i + rotationRad - π/2 ≤ -π/2 ≤ (2π/n)*(i+1) + rotationRad - π/2
 * 化簡後：-rotationRad 落在 [(2π/n)*i, (2π/n)*(i+1)]
 * 因此：i = floor( (-rotationAngle mod 360) / (360/n) )
 */
export const getSliceAtPointer = (rotationAngleDeg: number, itemCount: number): number => {
    const sliceAngleDeg = 360 / itemCount;
    // 正規化 -rotationAngle 到 [0, 360)
    const normalized = (((-rotationAngleDeg) % 360) + 360) % 360;
    return Math.floor(normalized / sliceAngleDeg) % itemCount;
};

interface UseWheelAnimationParams {
    /** 項目總數 */
    itemCount: number;
    /** 動畫進行中的角度更新回呼 */
    onAngleUpdate: (angle: number) => void;
    /** 動畫完成回呼，帶最終角度（由外部自行決定 slice） */
    onComplete: (finalAngle: number) => void;
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

        // 隨機選一個最終角度（0–360 之間的任意角度）
        const finalAngle = Math.random() * 360;
        // 加上基礎圈數形成完整旋轉
        const totalAngle = 360 * BASE_ROTATIONS + finalAngle;

        // ── prefers-reduced-motion: 跳過動畫直接出結果 ──
        if (prefersReducedMotion()) {
            onAngleUpdate(finalAngle);
            setTimeout(() => {
                setIsSpinning(false);
                onComplete(finalAngle);
            }, 100);
            return;
        }

        // ── 動畫迴圈 ──
        const animate = (timestamp: number) => {
            if (!startTimeRef.current) {
                startTimeRef.current = timestamp;
            }

            const elapsed = timestamp - startTimeRef.current;
            const progress = Math.min(elapsed / TOTAL_DURATION, 1);

            if (progress < 1) {
                const easedProgress = threePhaseEasing(progress);
                const currentAngle = easedProgress * totalAngle;
                // 正規化到 [0, 360)
                onAngleUpdate(((currentAngle % 360) + 360) % 360);
                animFrameRef.current = requestAnimationFrame(animate);
            } else {
                // 動畫結束：精確設定最終角度
                onAngleUpdate(finalAngle);
                startTimeRef.current = 0;
                setIsSpinning(false);
                onComplete(finalAngle);
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
