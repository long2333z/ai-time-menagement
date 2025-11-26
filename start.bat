@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion

:: ================================================
:: AI时间管理系统 - Windows启动脚本
:: ================================================

title AI时间管理系统

echo.
echo ================================================
echo   AI时间管理系统 - 启动中
echo ================================================
echo.

:: 检查 Node.js
echo [1/5] 检查 Node.js...
where node >nul 2>&1
if errorlevel 1 (
    echo [错误] 未安装 Node.js，请安装 Node.js 18+
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)
node --version
echo [完成] Node.js 已安装
echo.

:: 检查 Python
echo [2/5] 检查 Python...
where python >nul 2>&1
if errorlevel 1 (
    echo [错误] 未安装 Python，请安装 Python 3.10+
    echo 下载地址: https://www.python.org/
    pause
    exit /b 1
)
python --version
echo [完成] Python 已安装
echo.

:: 安装前端依赖
echo [3/5] 检查前端依赖...
if not exist "node_modules" (
    echo [信息] 未找到前端依赖，正在安装...
    echo [信息] 这可能需要几分钟，请稍候...
    echo.
    call npm install
    if errorlevel 1 (
        echo [错误] 前端依赖安装失败
        pause
        exit /b 1
    )
    echo.
    echo [完成] 前端依赖安装成功
) else (
    echo [完成] 前端依赖已安装
)
echo.

:: 安装后端依赖
echo [4/5] 检查后端依赖...
cd backend

if not exist "venv" (
    echo [信息] 未找到 Python 虚拟环境，正在创建...
    python -m venv venv
    if errorlevel 1 (
        echo [错误] 虚拟环境创建失败
        cd ..
        pause
        exit /b 1
    )
    echo [完成] 虚拟环境已创建
)

call venv\Scripts\activate.bat

echo [信息] 检查 Python 包...
pip show fastapi >nul 2>&1
if errorlevel 1 (
    echo [信息] 未找到后端依赖，正在安装...
    echo [信息] 这可能需要几分钟，请稍候...
    echo.
    pip install -r requirements.txt
    if errorlevel 1 (
        echo [错误] 后端依赖安装失败
        cd ..
        pause
        exit /b 1
    )
    echo.
    echo [完成] 后端依赖安装成功
) else (
    echo [完成] 后端依赖已安装
)

cd ..
echo.

:: 创建日志目录
if not exist "logs" mkdir logs

:: 初始化管理员账户
echo [信息] 初始化管理员账户...
cd backend
call venv\Scripts\activate.bat
python init_admin.py >nul 2>&1
cd ..
echo.

:: 启动服务
echo [5/5] 启动服务...
echo.
echo ================================================
echo   正在启动服务
echo ================================================
echo.

:: 启动后端
echo [信息] 在端口 8000 启动后端服务...
cd backend
start "AI时间管理-后端" cmd /k "call venv\Scripts\activate.bat && echo [后端] 启动服务器... && venv\Scripts\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"
cd ..
echo [完成] 后端服务已启动

:: 等待后端启动
echo [信息] 等待后端初始化 (5秒)...
timeout /t 5 /nobreak >nul 2>&1

:: 启动前端
echo [信息] 在端口 3000 启动前端服务...
start "AI时间管理-前端" cmd /k "echo [前端] 启动开发服务器... && npm run dev"
echo [完成] 前端服务已启动

:: 等待前端启动
echo [信息] 等待前端初始化 (3秒)...
timeout /t 3 /nobreak >nul 2>&1

echo.
echo ================================================
echo   启动完成！
echo ================================================
echo.
echo 服务正在运行:
echo   前端: http://localhost:3000
echo   后端: http://localhost:8000
echo   API文档: http://localhost:8000/docs
echo.
echo 提示:
echo   - 已打开两个新窗口用于前端和后端
echo   - 关闭这些窗口即可停止服务
echo   - 或运行 stop.bat 停止所有服务
echo   - 此窗口可以安全关闭(服务将继续运行)
echo.
echo 按任意键关闭此窗口...
pause >nul
