@echo off
chcp 65001 >nul
echo ========================================
echo   SubsTracker 部署腳本
echo ========================================
echo.

echo [1/3] 正在打包前端...
call npm --prefix frontend run build
if %errorlevel% neq 0 (
    echo ❌ 前端打包失敗！
    pause
    exit /b 1
)
echo ✅ 前端打包完成！
echo.

echo [2/3] 打包結果：
echo 📁 前端文件位於: frontend\dist\
echo.

echo [3/3] 接下來的步驟：
echo.
echo 1. 部署前端：
echo    - 選項A：上傳 frontend\dist\ 到 Cloudflare Pages
echo    - 選項B：上傳到 Netlify/Vercel
echo    - 選項C：上傳到你的虛擬主機
echo.
echo 2. 部署後端（Cloudflare Workers）：
echo    cd backend
echo    npx wrangler login
echo    npx wrangler deploy
echo.
echo 📖 詳細說明請查看 DEPLOYMENT.md
echo.

pause

