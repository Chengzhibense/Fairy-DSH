#Requires -Version 7.0
$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$testHome = if ($env:DSH_HOME) { [IO.Path]::GetFullPath($env:DSH_HOME) } else { Join-Path $repoRoot '.dsh-test-home' }
$expectedDshVersion = '0.2.1-alpha.5'

$dshCommand = Get-Command dsh.cmd -ErrorAction SilentlyContinue
if (-not $dshCommand) { $dshCommand = Get-Command dsh -ErrorAction SilentlyContinue }
if (-not $dshCommand) { throw 'dsh CLI is required for the isolated smoke test' }
$installedDshVersion = (& $dshCommand.Source --version 2>$null | Select-Object -First 1)
if ($installedDshVersion -ne $expectedDshVersion -and $env:DSH_ALLOW_UNSUPPORTED -ne '1') {
  throw "DSH $expectedDshVersion is required; found $installedDshVersion. This suite depends on the 0.2 Remote settings API and client module loader. Install the pinned CLI, or set DSH_ALLOW_UNSUPPORTED=1 to continue anyway."
}

$env:DSH_HOME = $testHome
$env:DSH_WORKSPACE_ROOT = Join-Path $repoRoot 'fairy-voice'
$env:DSH_FAIRY_REPO_ROOT = $repoRoot
$env:DSH_FAIRY_TEST_HOME = $testHome
$env:DSH_FAIRY_PROFILE_ROOT = Join-Path $repoRoot 'profiles\web'
$env:DSH_ACCEPTED_BASELINE_ROOT = Join-Path $testHome 'accepted-baselines'

$presetSource = Join-Path $repoRoot '.agent-presets\fairy'
$presetTarget = Join-Path $testHome '.agent-presets\fairy'
New-Item -ItemType Directory -Force -Path (Split-Path $presetTarget) | Out-Null
if (Test-Path -LiteralPath $presetTarget) {
  Move-Item -LiteralPath $presetTarget -Destination "$presetTarget.previous.$PID"
}
Copy-Item -LiteralPath $presetSource -Destination $presetTarget -Recurse

$profilesDir = Join-Path $testHome 'profiles'
$profileLink = Join-Path $profilesDir 'web'
$profileSource = Join-Path $repoRoot 'profiles\web'
New-Item -ItemType Directory -Force -Path $profilesDir | Out-Null
if (Test-Path -LiteralPath $profileLink) {
  $profileItem = Get-Item -LiteralPath $profileLink -Force
  if ($profileItem.LinkType -in @('Junction', 'SymbolicLink')) {
    if (-not (@($profileItem.Target) -contains $profileSource)) {
      Remove-Item -LiteralPath $profileLink -Force
    }
  } else {
    Move-Item -LiteralPath $profileLink -Destination "$profileLink.previous.$PID"
  }
}
if (-not (Test-Path -LiteralPath $profileLink)) {
  New-Item -ItemType Junction -Path $profileLink -Target $profileSource | Out-Null
}

$packages = @(
  'fairy-visual\dsh-fairy-visual',
  'fairy-voice\dsh-fairy-voice',
  'fairy-startup\dsh-fairy-startup',
  'browser-dock\dsh-browser-dock',
  'balance-meter\dsh-balance-meter'
)

Write-Host '[1/4] package dependencies'
foreach ($package in $packages) {
  Push-Location (Join-Path $repoRoot $package)
  try {
    pnpm install --frozen-lockfile --ignore-scripts --reporter=append-only
    if ($LASTEXITCODE -ne 0) { throw "pnpm install failed in $package" }
  } finally { Pop-Location }
}

Write-Host '[2/4] package tests'
foreach ($package in $packages) {
  Push-Location (Join-Path $repoRoot $package)
  try {
    npm test
    if ($LASTEXITCODE -ne 0) { throw "npm test failed in $package" }
  } finally { Pop-Location }
}

Write-Host '[3/4] profile dependency check'
Push-Location $profileSource
try {
  pnpm install --frozen-lockfile --ignore-scripts --reporter=append-only
  if ($LASTEXITCODE -ne 0) { throw 'profile dependency install failed' }
} finally { Pop-Location }

Write-Host '[4/4] isolated profile smoke test'
$stdout = Join-Path $testHome 'dsh-smoke.log'
$stderr = Join-Path $testHome 'dsh-smoke.err.log'
Remove-Item -LiteralPath $stdout, $stderr -Force -ErrorAction SilentlyContinue
$launchArgs = @('--profile', 'web', '--no-open', '--port', '0')
$startFile = $dshCommand.Source
$startArgs = $launchArgs
if ([IO.Path]::GetExtension($startFile) -eq '.ps1') {
  $startFile = (Get-Command powershell.exe).Source
  $startArgs = @('-NoProfile', '-File', $dshCommand.Source) + $launchArgs
}
$process = Start-Process -FilePath $startFile -ArgumentList $startArgs -WindowStyle Hidden `
  -RedirectStandardOutput $stdout -RedirectStandardError $stderr -PassThru
try {
  $deadline = (Get-Date).AddSeconds(40)
  $ready = $null
  while ((Get-Date) -lt $deadline) {
    Start-Sleep -Milliseconds 500
    if ($process.HasExited) {
      $log = Get-Content $stdout, $stderr -ErrorAction SilentlyContinue | Select-Object -Last 40
      throw "DSH exited during the isolated smoke test.`n$($log -join "`n")"
    }
    $ready = Select-String -Path $stdout -Pattern '^dsh web: http://127\.0\.0\.1:\d+' -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($ready) { break }
  }
  if (-not $ready) {
    $log = Get-Content $stdout, $stderr -ErrorAction SilentlyContinue | Select-Object -Last 40
    throw "DSH did not report a local web address.`n$($log -join "`n")"
  }
  Write-Host $ready.Line
} finally {
  if (-not $process.HasExited) {
    & taskkill.exe /PID $process.Id /T /F | Out-Null
  }
}
