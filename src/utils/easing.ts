/**
 * Easing 函數集
 *
 * 用於轉盤兩段式動畫的時間曲線計算。
 * 所有函數接受 t ∈ [0, 1]，回傳 [0, 1] 的進度值。
 */

/** 加速曲線 — Phase 1 高速啟動 */
export const easeInQuad = (t: number): number => t * t;

/** 減速曲線 — Phase 2 咪牌減速，用更強的 quintic 讓尾端更慢 */
export const easeOutQuint = (t: number): number => 1 - Math.pow(1 - t, 5);

/**
 * 組合式兩段 easing（移除彈性回彈）
 *
 * - Phase 1 (0 ~ 0.25): 高速旋轉加速 (easeInQuad)
 * - Phase 2 (0.25 ~ 1): 平滑減速到停止 (easeOutQuint)
 *
 * 不再有 Phase 3 的 elasticOut，
 * 消除「快停了又突然跳走」的問題。
 */
export const threePhaseEasing = (
  t: number,
  p1End: number = 0.25
): number => {
  if (t <= p1End) {
    // Phase 1：加速，佔全部角度的 20%
    const localT = t / p1End;
    return easeInQuad(localT) * 0.2;
  } else {
    // Phase 2：平滑減速，佔 20%→100%
    const localT = (t - p1End) / (1 - p1End);
    return 0.2 + easeOutQuint(localT) * 0.8;
  }
};
