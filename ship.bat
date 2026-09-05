@echo off
git add .
git commit -m "Update BADDIECULTURE"
if errorlevel 1 exit /b 1
git push
pause