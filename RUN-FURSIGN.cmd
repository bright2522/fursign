@echo off
setlocal
cd /d "%~dp0"

set "NODE_EXE=node"
where node >nul 2>nul
if errorlevel 1 (
  set "NODE_EXE=C:\Users\USER\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
  set "PATH=C:\Users\USER\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;C:\Windows\System32;%PATH%"
)

if not exist "node_modules\vinext\dist\cli.js" (
  echo [Fursign] Missing project dependencies.
  echo Open this project with Codex once, then try again.
  pause
  exit /b 1
)

if not exist "dist\server\index.js" (
  echo [Fursign] Building the website for the first run...
  "%NODE_EXE%" "node_modules\vinext\dist\cli.js" build
  if errorlevel 1 (
    echo [Fursign] Build failed.
    pause
    exit /b 1
  )
)

echo [Fursign] Running at http://localhost:3000/
echo Keep this window open. Press Ctrl+C to stop.
"%NODE_EXE%" "node_modules\vinext\dist\cli.js" start

