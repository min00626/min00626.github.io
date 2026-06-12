$repo = (Get-Location).Path

$edge = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
$ud = Join-Path $repo '.tmp-edge-profile'

New-Item -ItemType Directory -Force -Path $ud | Out-Null

$pdfDir = Join-Path $repo '_site\projects'
$pdf = Join-Path $pdfDir 'project-r.pdf'

New-Item -ItemType Directory -Force -Path $pdfDir | Out-Null

if (Test-Path $pdf) {
    Remove-Item $pdf -Force
}

$url = 'http://127.0.0.1:8787/_site/projects/project-r.pdf-ready.html'

$server = Start-Process `
    -FilePath python `
    -ArgumentList @('-m','http.server','8787','--bind','127.0.0.1') `
    -WorkingDirectory $repo `
    -PassThru `
    -WindowStyle Hidden

try {
    Start-Sleep -Seconds 3

    & $edge `
        --headless `
        --disable-gpu `
        --user-data-dir=$ud `
        --run-all-compositor-stages-before-draw `
        --virtual-time-budget=30000 `
        --no-pdf-header-footer `
        "--print-to-pdf=$pdf" `
        $url

    Start-Sleep -Seconds 2
}
finally {
    if ($server -and !$server.HasExited) {
        Stop-Process -Id $server.Id -Force
    }
}

if (Test-Path $pdf) {
    Write-Host ""
    Write-Host "PDF generated successfully:"
    Get-Item $pdf | Select-Object FullName, Length, LastWriteTime
}
else {
    throw "PDF was not generated: $pdf"
}