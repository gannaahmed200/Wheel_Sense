@echo off
setlocal

set "ROOT=%~dp0"
set "APP_ROOT=%ROOT%WheelTrack-Analytics"
set "BACKEND_ROOT=%ROOT%backend"
set "BACKEND_PY=%BACKEND_ROOT%\.venv\Scripts\python.exe"
set "PORT=5173"

cd /d "%ROOT%" || (
  echo Could not find "%ROOT%".
  pause
  exit /b 1
)

where node >nul 2>nul || (
  echo Node.js is required but was not found on PATH.
  echo Install Node.js, then run this file again.
  pause
  exit /b 1
)

where python >nul 2>nul || (
  echo Python is required but was not found on PATH.
  echo Install Python, then run this file again.
  pause
  exit /b 1
)

if not exist "%BACKEND_PY%" (
  echo Creating Python backend virtual environment...
  python -m venv "%BACKEND_ROOT%\.venv"
  if errorlevel 1 (
    echo Failed to create Python virtual environment.
    pause
    exit /b 1
  )
)

if not exist "%BACKEND_ROOT%\.venv\.wheelsense-installed" (
  echo Installing Python backend dependencies. This can take a while the first time...
  "%BACKEND_PY%" -m pip install --upgrade pip
  "%BACKEND_PY%" -m pip install -r "%BACKEND_ROOT%\requirements.txt"
  if errorlevel 1 (
    echo Python dependency installation failed.
    pause
    exit /b 1
  )
  echo installed>"%BACKEND_ROOT%\.venv\.wheelsense-installed"
)

echo Starting Python FastAPI backend...
start "WheelSense Backend" /d "%BACKEND_ROOT%" /min "%BACKEND_PY%" start.py

echo Waiting for backend health check...
for /l %%i in (1,1,45) do (
  powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $r = Invoke-WebRequest -Uri 'http://127.0.0.1:8000/api/health' -UseBasicParsing -TimeoutSec 2; if ($r.StatusCode -eq 200) { exit 0 } } catch { exit 1 }"
  if not errorlevel 1 goto backend_ready
  timeout /t 1 /nobreak >nul
)
echo Backend did not become ready at http://127.0.0.1:8000/api/health.
pause
exit /b 1

:backend_ready
cd /d "%APP_ROOT%" || (
  echo Could not find "%APP_ROOT%".
  pause
  exit /b 1
)

where pnpm >nul 2>nul
if not errorlevel 1 (
  set "PNPM=pnpm"
) else (
  where corepack >nul 2>nul
  if not errorlevel 1 (
    set "PNPM=corepack pnpm"
  ) else (
    set "PNPM=npx --yes pnpm@9"
  )
)

if not exist "%APP_ROOT%\node_modules\.modules.yaml" (
  echo Installing website dependencies. This may take a few minutes the first time...
  call %PNPM% install
  if errorlevel 1 (
    echo Dependency installation failed.
    pause
    exit /b 1
  )
)

echo.
echo Starting WheelTrack website...
echo URL: http://localhost:%PORT%
echo Backend: http://127.0.0.1:8000/api/health
echo.
start "" "http://localhost:%PORT%"

call %PNPM% --filter @workspace/wheeltrack run dev

pause
