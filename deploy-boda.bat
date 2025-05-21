@echo off
echo === Construyendo proyecto Astro ===
call npm run build

if %errorlevel% neq 0 (
    echo Fallo durante el build. Revisa errores anteriores.
    pause
    exit /b %errorlevel%
)

echo === Desplegando en Firebase ===
firebase deploy

if %errorlevel% neq 0 (
    echo Fallo durante el deploy. Revisa errores anteriores.
    pause
    exit /b %errorlevel%
)

echo === ¡Despliegue completado con éxito! ===
pause
