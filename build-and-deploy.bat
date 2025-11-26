@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: ================================================
:: 构建前端并部署到后端static目录
:: ================================================

echo.
echo ================================================
echo   构建前端项目
echo ================================================
echo.

:: 检查Node.js
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js 未安装
    pause
    exit /b 1
)

:: 安装依赖
if not exist "node_modules" (
    echo [INFO] 安装前端依赖...
    call npm install
    if errorlevel 1 (
        echo [ERROR] 依赖安装失败
        pause
        exit /b 1
    )
)

:: 构建前端
echo [INFO] 构建前端项目...
call npm run build
if errorlevel 1 (
    echo [ERROR] 构建失败
    pause
    exit /b 1
)

:: 创建后端static目录
echo [INFO] 准备部署目录...
if exist "backend\static" rd /s /q "backend\static"
mkdir "backend\static"

:: 复制构建产物
echo [INFO] 复制构建产物到后端...
xcopy /E /I /Y "dist\*" "backend\static\"

echo.
echo ================================================
echo   构建完成！
echo ================================================
echo.
echo 前端已构建并复制到 backend\static\
echo 现在可以启动后端服务：
echo   cd backend
echo   uvicorn main:app --host 0.0.0.0 --port 8000
echo.
pause
