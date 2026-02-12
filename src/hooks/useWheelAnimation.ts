import { useRef, useCallback, useState } from 'react';
import { threePhaseEasing } from '../utils/easing';

/**
 * 三段式轉盤動畫引擎 v3
 *
 * 核心設計：
 * 1. 結果在動畫開始前即決定（公平性）
 * 2. 動畫純粹為「演出」，使用 requestAnimationFrame 驅動
 * 3. 三段式節奏：高速 → 減速咪牌 → 停止回彈
 * 4. 使用 getSliceAtPointer 反向驗證，確保停輪角度一定正確
 * 5. 尊重 prefers-reduced-motion（UX #9）
 *
 * 角度系統說明：
 * - Canvas 的 arc() 中，角度 0 = 3 點鐘方向，順時針增加
 * - 繪製時每個 slice 的起始角 = sliceAngle * i + rotationRad - π/2
 *   其中 -π/2 是為了讓 slice 0 從 12 點鐘（頂部）開始
 * - rotationAngle 增加 → slice 順時針旋轉 → 指針指向前面的 slice
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
 * 給定旋轉角度，計算指針（12 點鐘）指向哪個 slice
 *
 * 繪製邏輯：slice i 佔據角度 [sliceAngle*i, sliceAngle*(i+1)]（相對原點）
 * 加上 rotationAngle 後，slice i 在畫面上的位置 = sliceAngle*i + rotationAngle
 * 指針在 0°（12 點鐘，因為繪製時有 -π/2 偏移，所以相對座標是 0）
 *
 * 指針指向的 slice = 找到 i 使得指針角度落在 [sliceAngle*i + rotation, sliceAngle*(i+1) + rotation] 中
 * 等價於：(0 - rotation) mod 360 落在 [sliceAngle*i, sliceAngle*(i+1)]
 * 等價於：i = floor( ((360 - rotation) % 360) / sliceAngle )
 */
const getSliceAtPointer = (rotationAngle: number, itemCount: number): number => {
    const sliceAngle = 360 / itemCount;
    // 正規化角度到 [0, 360)
    const normalized = (((-rotationAngle) % 360) + 360) % 360;
    return Math.floor(normalized / sliceAngle) % itemCount;
};

/**
 * 計算讓 resultIndex 停在指針下方的旋轉角度
 *
 * 反推：如果 getSliceAtPointer(angle, count) = resultIndex
 * 那麼 (((-angle) % 360) + 360) % 360 應落在 [sliceAngle * resultIndex, sliceAngle * (resultIndex + 1)]
 * 設 target = sliceAngle * resultIndex + sliceAngle/2（中心）
 * 則 -angle ≡ target (mod 360)
 * → angle ≡ -target (mod 360) = (360 - target) % 360
 */
const computeFinalAngle = (resultIndex: number, itemCount: number): number => {
    const sliceAngle = 360 / itemCount;
    const sliceCenter = sliceAngle * resultIndex + sliceAngle / 2;
    // 加隨機偏移（在 slice 中心附近，±20% 確保不碰邊線）
    const randomOffset = (Math.random() - 0.5) * sliceAngle * 0.4;
    const angle = ((-(sliceCenter + randomOffset)) % 360 + 360) % 360;

    // 驗證！如果計算錯誤，log 警告
    const verify = getSliceAtPointer(angle, itemCount);
    if (verify !== resultIndex) {
        console.warn(
            `[Wheel] 角度驗證失敗！預期 slice ${resultIndex}，但角度 ${angle.toFixed(1)}° 對應 slice ${verify}`
        );
        // 回退到精確中心角（無偏移）
        return ((-(sliceCenter)) % 360 + 360) % 360;
    }

    return angle;
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

        // ── prefers-reduced-motion: 跳過動畫直接出結果 ──
        if (prefersReducedMotion()) {
            onAngleUpdate(finalAngle);
            setTimeout(() => {
                setIsSpinning(false);
                onComplete(resultIndex, finalAngle);
            }, 100);
            return;
        }

        // 總旋轉角度 = 完整圈數 + 最終角度
        const totalAngle = 360 * BASE_ROTATIONS + finalAngle;

        // ── 2. 動畫迴圈 ──
        const animate = (timestamp: number) => {
            if (!startTimeRef.current) {
                startTimeRef.current = timestamp;
            }

            const elapsed = timestamp - startTimeRef.current;
            const progress = Math.min(elapsed / TOTAL_DURATION, 1);

            if (progress < 1) {
                const easedProgress = threePhaseEasing(progress);
                const currentAngle = easedProgress * totalAngle;
                onAngleUpdate(((currentAngle % 360) + 360) % 360);
                animFrameRef.current = requestAnimationFrame(animate);
            } else {
                // ── 3. 動畫結束：強制設定精確最終角度 ──
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
