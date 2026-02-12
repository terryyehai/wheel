# 待生成背景圖片清單

**預計生成時間**: 2026-02-12 18:51 (API 配額重置後)

## 圖片規格

所有圖片統一規格:
- 解析度: 1920x1080
- 格式: PNG
- 用途: 各模式的背景圖片

## 生成提示詞

### 1. 轉盤模式 (wheel_bg.png)
```
A vibrant casino-themed background with neon lights, glowing circles, and radial burst patterns in purple and blue tones. Abstract geometric shapes, light rays emanating from center. Dark background with bright accent colors. Modern, energetic, gambling aesthetic. 1920x1080 resolution.
```

### 2. 刮刮樂模式 (scratch_bg.png)
```
A textured paper background with subtle lottery ticket patterns, silver metallic scratches, and golden sparkles. Warm orange and yellow tones. Realistic paper texture with embossed details. Lottery scratch card aesthetic. 1920x1080 resolution.
```

### 3. 扭蛋機模式 (gachapon_bg.png)
```
A playful pop art background with colorful polka dots, pastel bubbles, and cute kawaii elements in pink, mint green, and soft yellow. Cheerful Japanese toy machine aesthetic with floating capsules. 1920x1080 resolution.
```

### 4. 塔羅抽卡模式 (card_bg.png)
```
A mystical starry night background with constellation patterns, purple nebula clouds, and golden celestial symbols. Tarot card fortune telling aesthetic with crescent moons and stars. Deep purple and indigo tones. 1920x1080 resolution.
```

### 5. 抽籤模式 (omikuji_bg.png)
```
A traditional Japanese shrine background with seigaiha wave patterns in red and white, cherry blossom petals, and torii gate silhouettes. Elegant oriental aesthetic with gold accents. 1920x1080 resolution.
```

### 6. 紅包模式 (red_envelope_bg.png)
```
A festive Chinese New Year background with red and gold colors, auspicious cloud patterns, golden coins, and traditional paper-cut decorations. Lanterns and fireworks in the background. Vibrant celebration aesthetic. 1920x1080 resolution.
```

## 整合步驟

生成圖片後需執行:

1. 將圖片移動到 `public/backgrounds/` 目錄
2. 更新 `src/index.css` 添加背景圖片樣式:
   ```css
   body[data-theme="wheel"] {
     background-image: url('/backgrounds/wheel_bg.png');
     background-size: cover;
     background-position: center;
   }
   /* 其他模式同理 */
   ```
3. 重新建置並部署: `npm run deploy`
