$ErrorActionPreference = "Stop"
Set-Location (Split-Path -Parent $MyInvocation.MyCommand.Path)

if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
    if (-not (Get-Command winget.exe -ErrorAction SilentlyContinue)) {
        throw "Node.js is missing and winget is unavailable."
    }

    winget install `
        --id OpenJS.NodeJS.LTS `
        --exact `
        --accept-package-agreements `
        --accept-source-agreements

    if ($LASTEXITCODE -ne 0) {
        throw "Node.js installation failed."
    }

    $env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") +
        ";" +
        [Environment]::GetEnvironmentVariable("Path", "User")
}

npm.cmd install

if ($LASTEXITCODE -ne 0) {
    throw "npm install failed."
}

Write-Host ""
Write-Host "Starting Next.js development server..." -ForegroundColor Green
Write-Host "Open http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

npm.cmd run dev
