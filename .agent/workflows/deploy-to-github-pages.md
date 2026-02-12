---
description: Deploy the application to GitHub Pages (Automatic & Manual)
---

# Deploy to GitHub Pages

此流程涵蓋兩種部署方式：**GitHub Actions 自動部署** (推薦) 與 **本地手動部署** (包含解決中文路徑問題的修復方案)。

## Method 1: GitHub Actions (Recommended)

這是最標準且穩定的做法。只要推送代碼，GitHub Server 會自動完成建置與部署。

1. 確保專案根目錄有 `.github/workflows/deploy.yml` 文件。
2. 提交所有變更：
   ```bash
   git add .
   git commit -m "chore: deploy updates"
   ```
3. 推送至 `main` 分支：
   ```bash
   git push origin main
   ```
4. 前往 GitHub Repository 的 **Actions** 頁籤查看部署進度。

---

## Method 2: Manual Local Deployment (Fallback)

當需要從本地直接更新 `gh-pages` 分支，或 GitHub Actions 異常時使用。

**⚠️ 關鍵修復 (Critical Fix)**：
若專案路徑包含**非 ASCII 字元** (如中文「抽抽樂大轉盤」)，Node.js v24+ 與 Vite 在 Windows 上會發生建置錯誤。必須使用 `subst` 掛載虛擬磁碟來繞過此問題。

1. **掛載虛擬磁碟 (Mount Virtual Drive)**
   將當前目錄對應到 `X:` 槽 (或其他未使用的磁碟代號)。
   ```powershell
   subst X: "D:\Path\To\Your\Project"
   ```

2. **執行建置與部署 (Build & Deploy)**
   切換到虛擬磁碟並執行指令。
   ```powershell
   X:
   npm run build
   npx gh-pages -d dist
   ```

3. **卸載虛擬磁碟 (Unmount)**
   完成後清理環境。
   ```powershell
   // 切換回原磁碟 (例如 D:)
   D: 
   subst X: /D
   ```

### One-Liner (PowerShell)
```powershell
subst X: "$PWD"; X:; npm run build; npx gh-pages -d dist; c:; subst X: /D
```
