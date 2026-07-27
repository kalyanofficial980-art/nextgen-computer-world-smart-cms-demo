$ErrorActionPreference = "Stop"
Set-Location (Split-Path -Parent $MyInvocation.MyCommand.Path)

$RepoName = "nextgen-computer-world-smart-cms-demo"
$VercelProject = "nextgen-computer-world-smart-cms-demo"

function Refresh-Path {
    $env:Path =
        [Environment]::GetEnvironmentVariable("Path", "Machine") +
        ";" +
        [Environment]::GetEnvironmentVariable("Path", "User")
}

function Ensure-Tool {
    param(
        [Parameter(Mandatory)][string]$Command,
        [Parameter(Mandatory)][string]$Package,
        [Parameter(Mandatory)][string]$Name
    )

    Refresh-Path

    if (Get-Command $Command -ErrorAction SilentlyContinue) {
        return
    }

    if (-not (Get-Command winget.exe -ErrorAction SilentlyContinue)) {
        throw "$Name is missing and winget is unavailable."
    }

    winget install `
        --id $Package `
        --exact `
        --accept-package-agreements `
        --accept-source-agreements

    if ($LASTEXITCODE -ne 0) {
        throw "$Name installation failed."
    }

    Refresh-Path
}

Ensure-Tool "git.exe" "Git.Git" "Git"
Ensure-Tool "gh.exe" "GitHub.cli" "GitHub CLI"
Ensure-Tool "npm.cmd" "OpenJS.NodeJS.LTS" "Node.js"

npm.cmd install
if ($LASTEXITCODE -ne 0) {
    throw "npm install failed."
}

npm.cmd run typecheck
if ($LASTEXITCODE -ne 0) {
    throw "TypeScript check failed."
}

npm.cmd run build
if ($LASTEXITCODE -ne 0) {
    throw "Next.js production build failed."
}

gh.exe auth status *> $null
if ($LASTEXITCODE -ne 0) {
    gh.exe auth login --web --git-protocol https
    if ($LASTEXITCODE -ne 0) {
        throw "GitHub login failed."
    }
}

$GitHubUser = (gh.exe api user --jq ".login" | Out-String).Trim()

if (-not (Test-Path ".git")) {
    git.exe init
    git.exe branch -M main
}

if (-not (git.exe config --global user.name)) {
    git.exe config --global user.name "Kalyan Web Studio"
}

if (-not (git.exe config --global user.email)) {
    git.exe config --global user.email "$GitHubUser@users.noreply.github.com"
}

git.exe add -A

if (git.exe status --porcelain) {
    git.exe commit -m "Create NextGen Smart Catalogue CMS demo"
    if ($LASTEXITCODE -ne 0) {
        throw "Git commit failed."
    }
}

if (-not ((git.exe remote) -contains "origin")) {
    gh.exe repo view "$GitHubUser/$RepoName" *> $null

    if ($LASTEXITCODE -eq 0) {
        git.exe remote add origin "https://github.com/$GitHubUser/$RepoName.git"
        git.exe push -u origin main
    }
    else {
        gh.exe repo create `
            "$GitHubUser/$RepoName" `
            --public `
            --source "." `
            --remote origin `
            --push `
            --description "NextGen Computer World Smart Catalogue CMS demo built with Next.js, React, TypeScript and Tailwind CSS."
    }
}
else {
    git.exe push -u origin main
}

if ($LASTEXITCODE -ne 0) {
    throw "GitHub push failed."
}

if (-not (Get-Command vercel.cmd -ErrorAction SilentlyContinue)) {
    npm.cmd install --global vercel@latest
    if ($LASTEXITCODE -ne 0) {
        throw "Vercel CLI installation failed."
    }
    Refresh-Path
}

vercel.cmd whoami *> $null
if ($LASTEXITCODE -ne 0) {
    vercel.cmd login
    if ($LASTEXITCODE -ne 0) {
        throw "Vercel login failed."
    }
}

vercel.cmd link --yes --project $VercelProject

if ($LASTEXITCODE -ne 0) {
    throw "Vercel project linking failed."
}

$Output = @(
    vercel.cmd --prod --yes 2>&1
)

$ExitCode = $LASTEXITCODE
$Output | ForEach-Object { Write-Host $_ }
$Output | Out-String | Set-Content "vercel-deployment.log" -Encoding UTF8

if ($ExitCode -ne 0) {
    throw "Vercel production deployment failed. Check vercel-deployment.log."
}

$Clean = ($Output | Out-String) -replace '\x1B\[[0-?]*[ -/]*[@-~]', ''
$Matches = [regex]::Matches(
    $Clean,
    'https://[a-zA-Z0-9][a-zA-Z0-9\-.]*\.vercel\.app'
)

if ($Matches.Count -gt 0) {
    $Url = $Matches[$Matches.Count - 1].Value

    @"
NEXTGEN COMPUTER WORLD SMART CMS DEMO

Live Website:
$Url

GitHub:
https://github.com/$GitHubUser/$RepoName

Phase 1:
Public Next.js website complete

Phase 2:
Supabase CMS connection pending
"@ | Set-Content "LIVE-URL.txt" -Encoding UTF8

    Start-Process $Url
}

Write-Host "GitHub push and Vercel production deployment complete." -ForegroundColor Green
