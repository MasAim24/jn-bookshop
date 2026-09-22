@echo off
title Membangun JN Book & Stationary Shop Desktop .EXE
echo ========================================================
echo   JN BOOK ^& STATIONARY SHOP - WINDOWS BUILDER (.EXE)
echo ========================================================
echo.
echo [1/3] Memeriksa dependensi Node.js ^& PNPM...
where pnpm >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] pnpm tidak ditemukan, menggunakan npm bawaan...
    call npm install
    call npm install --save-dev electron electron-builder
    echo [2/3] Mengompilasi aplikasi frontend Vite...
    call npm run build
    echo [3/3] Memaketkan standalone installer .exe dan portable .exe...
    call npx electron-builder --win nsis portable
) else (
    call pnpm install
    call pnpm add -D electron electron-builder
    echo [2/3] Mengompilasi aplikasi frontend Vite...
    call pnpm run build
    echo [3/3] Memaketkan standalone installer .exe dan portable .exe...
    call npx electron-builder --win nsis portable
)

echo.
echo ========================================================
echo   BUILD SELESAI SUKSES!
echo   File .exe Anda tersedia di folder: dist_electron/
echo   1. JN Book ^& Stationary Shop-1.0.0-Setup.exe (Installer)
echo   2. JN Book ^& Stationary Shop-Portable.exe (Tanpa Instalasi)
echo ========================================================
pause
