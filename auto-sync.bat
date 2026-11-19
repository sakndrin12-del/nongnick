@echo off
title GitHub Auto-Sync (nongnick)
cd /d "%~dp0"
echo Starting automatic GitHub sync for https://github.com/sakndrin12-del/nongnick.git ...
node scripts/auto-sync-github.mjs
pause
