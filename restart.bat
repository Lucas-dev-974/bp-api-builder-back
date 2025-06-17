@echo off
echo Redemarrage via NPM...
timeout /t 2 /nobreak > NUL

:: Fermer les processus Node.js (à ajuster selon ton environnement)
taskkill /F /IM node.exe

timeout /t 1 /nobreak > NUL

:: Aller dans le répertoire du projet
cd /d %~dp0

:: Redémarrer via npm
call npm run dev

exit