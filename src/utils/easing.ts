/**
 * Easing 函數集
 *
 * 用於轉盤三段式動畫的時間曲線計算。
 * 所有函數接受 t ∈ [0, 1]，回傳 [0, 1] 的進度值。
 */

/** 加速曲線 — Phase 1 高速啟動 */
export const easeInQuad = (t: number): number => t * t;

/** 減速曲線 — Phase 2 咪牌減速 */
export const easeOutQuart = (t: number): number => 1 - Math.pow(1 - t, 4);

/**
 * 彈性回彈 — Phase 3 停止回彈
 * 產生微幅 overshoot 後回歸，模擬物理慣性感。
 */
export const elasticOut = (t: number): number => {
  if (t === 0 || t === 1) return t;
  const p = 0.4;
  return Math.pow(2, -10 * t) * Math.sin(((t - p / 4) * (2 * Math.PI)) / p) + 1;
};

/**
 * 組合式三段 easing
 *
 * 整合三段動畫的進度計算：
 * - Phase 1 (0 ~ p1End): 高速旋轉 (easeInQuad)
 * - Phase 2 (p1End ~ p2End): 減速咪牌 (easeOutQuart)
 * - Phase 3 (p2End ~ 1): 回彈停止 (elasticOut)
 */
export const threePhaseEasing = (
  t: number,
  p1End: number = 0.3,
  p2End: number = 0.92
): number => {
  if (t <= p1End) {
    // Phase 1：將 [0, p1End] 映射到快速旋轉的前 30% 角度
    const localT = t / p1End;
    return easeInQuad(localT) * 0.3;
  } else if (t <= p2End) {
    // Phase 2：將 [p1End, p2End] 映射到 30%~97% 的角度（留 3% 給回彈）
    const localT = (t - p1End) / (p2End - p1End);
    return 0.3 + easeOutQuart(localT) * 0.67;
  } else {
    // Phase 3：將 [p2End, 1] 映射到 97%~100%，加上 overshoot
    const localT = (t - p2End) / (1 - p2End);
    return 0.97 + elasticOut(localT) * 0.03;
  }
};
