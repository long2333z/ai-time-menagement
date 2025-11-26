@echo off
chcp 65001 >nul

:: ================================================
:: AI时间管理系统 - Windows停止脚本
:: ================================================

title 停止AI时间管理系统

echo.
echo ================================================
echo   停止AI时间管理系统
echo ================================================
echo.

:: 显示当前运行的进程
echo [信息] 检查运行中的服务...
echo.

:: 检查并停止 Node.js 进程
tasklist | findstr "node.exe" >nul 2>&1
if %errorlevel% equ 0 (
    echo [信息] 发现 Node.js 进程，正在停止...
    taskkill /F /IM node.exe /T >nul 2>&1
    if %errorlevel% equ 0 (
        echo [完成] 前端服务已停止
    ) else (
        echo [警告] 停止前端服务时出现问题
    )
) else (
    echo [信息] 前端服务未运行
)
echo.

:: 检查并停止 Python 进程
tasklist | findstr "python.exe" >nul 2>&1
if %errorlevel% equ 0 (
    echo [信息] 发现 Python 进程，正在停止...
    taskkill /F /IM python.exe /T >nul 2>&1
    if %errorlevel% equ 0 (
        echo [完成] 后端服务已停止
    ) else (
        echo [警告] 停止后端服务时出现问题
    )
) else (
    echo [信息] 后端服务未运行
)
echo.

:: 等待进程完全终止
echo [信息] 等待进程完全终止...
timeout /t 2 /nobreak >nul 2>&1

:: 再次检查是否还有残留进程
tasklist | findstr "node.exe python.exe" >nul 2>&1
if %errorlevel% equ 0 (
    echo [警告] 仍有进程在运行，尝试再次终止...
    taskkill /F /IM node.exe /T >nul 2>&1
    taskkill /F /IM python.exe /T >nul 2>&1
    timeout /t 1 /nobreak >nul 2>&1
)

:: 清理日志文件（可选）
set /p CLEAN_LOGS="是否清理日志文件？(y/N): "
if /i "%CLEAN_LOGS%"=="y" (
    if exist "logs" (
        echo [信息] 正在清理日志文件...
        del /Q logs\*.log >nul 2>&1
        del /Q logs\*.pid >nul 2>&1
        echo [完成] 日志文件已清理
    )
)

echo.
echo ================================================
echo   所有服务已停止
echo ================================================
echo.
pause
