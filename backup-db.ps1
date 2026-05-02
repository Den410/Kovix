param(
    [string]$BackupPath = "C:\backups",
    [string]$ServerName = "localhost,1433",
    [string]$Username = "sa",
    [string]$Password = "KovixStrongPass123!",
    [string]$Database = "KovixDb"
)

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFileName = "KovixDb_backup_$timestamp.bak"
$backupFilePath = Join-Path $BackupPath $backupFileName

Write-Host "================================"
Write-Host "Розпочинаємо бекап БД..."
Write-Host "================================"
Write-Host "Папка: $BackupPath"
Write-Host "Файл: $backupFileName"
Write-Host "БД: $Database"
Write-Host "Сервер: $ServerName"

if (-not (Test-Path $BackupPath)) {
    Write-Host "Папка не існує: $BackupPath"
    Write-Host "Створюємо папку..."
    New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null
}

$backupQuery = @"
BACKUP DATABASE [$Database]
TO DISK = '/var/opt/mssql/backups/$backupFileName'
WITH FORMAT, INIT, SKIP, NOREWIND, NOUNLOAD, COMPRESSION;
"@

Write-Host ""
Write-Host "Виконуємо BACKUP..."

try {
    # Спочатку переконаємось, що папка для бекапів існує
    docker exec mssql_kovix mkdir -p /var/opt/mssql/backups 2>&1 | Out-Null
    
    $result = docker exec -i mssql_kovix /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P KovixStrongPass123! -C -Q $backupQuery 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "БЕКАП УСПІШНО СТВОРЕНИЙ!"
        Write-Host "Статистика:"
        
        Start-Sleep -Seconds 2
        $fileInfo = docker exec mssql_kovix ls -lh /var/opt/mssql/backups/$backupFileName 2>&1 | findstr $backupFileName
        Write-Host "Розмір: $fileInfo"
        
        Write-Host ""
        Write-Host "Файл: $backupFilePath"
        Write-Host "Час: $(Get-Date -Format 'dd.MM.yyyy HH:mm:ss')"
        Write-Host "================================"
    }
    else {
        Write-Host ""
        Write-Host "ПОМИЛКА при бекапу:"
        Write-Host $result
        exit 1
    }
}
catch {
    Write-Host ""
    Write-Host "ПОМИЛКА: $_"
    exit 1
}

Write-Host ""
Write-Host "Завдання завершено успішно!"
Write-Host "================================"
