/**
 * 高亮度配色生成器
 *
 * 為轉盤各區塊生成鮮明、高飽和度的色板。
 * 使用 HSL 色彩空間，飽和度 65–80%，亮度 45–60%。
 * 黃金角度分佈確保相鄰色塊色相差異明顯。
 */

interface SliceColor {
    /** 區塊背景色 */
    bg: string;
    /** 文字顏色 */
    text: string;
}

/**
 * 根據項目數量生成高亮轉盤色板
 *
 * @param count 項目數量 (2–50)
 * @returns 每個 slice 的背景色與文字色
 */
export const generateColors = (count: number): SliceColor[] => {
    const colors: SliceColor[] = [];
    const goldenAngle = 137.508; // 黃金角度分佈，避免相鄰色相近

    for (let i = 0; i < count; i++) {
        const hue = (i * goldenAngle) % 360;
        // 高飽和度：65–80%（鮮豔但不刺眼）
        const saturation = 65 + (i % 3) * 7;
        // 亮度交替：奇偶交替深淺，增加對比
        const lightnessBase = i % 2 === 0 ? 48 : 58;
        const lightness = lightnessBase + (i % 5);

        colors.push({
            bg: `hsl(${Math.round(hue)}, ${saturation}%, ${lightness}%)`,
            text: lightness > 55 ? '#1a1d2e' : '#ffffff',
        });
    }

    return colors;
};
