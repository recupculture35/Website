@echo off
title RECUP CULTURE - Serveur Local
echo ========================================================
echo   Demarrage du site et du serveur RECUP CULTURE...
echo ========================================================
echo.
cd /d "%~dp0"

echo Verification des dependances...
if not exist "node_modules" (
    echo Installation initiale des dependances...
    call npm install
)

echo Ouverture de votre navigateur sur http://localhost:3000 ...
start http://localhost:3000

echo.
echo ========================================================
echo   Le serveur est en cours d'execution sur le port 3000.
echo   - Site public : http://localhost:3000/
echo   - Administration : http://localhost:3000/admin.html
echo   Fermez cette fenetre pour arreter le serveur.
echo ========================================================
echo.

node server.js
pause
