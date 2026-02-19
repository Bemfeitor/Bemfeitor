# Script de Deploy para GitHub
# Execute: .\deploy.ps1

Write-Host "🚀 Deploy Audit-Cobranças para GitHub" -ForegroundColor Cyan
Write-Host ""

$username = Read-Host "Digite seu nome de usuário do GitHub"
$repoName = Read-Host "Digite o nome do repositório (padrão: audit-cobrancas)"

if ([string]::IsNullOrWhiteSpace($repoName)) {
    $repoName = "audit-cobrancas"
}

Write-Host ""
Write-Host "📋 Instruções:" -ForegroundColor Yellow
Write-Host "1. Crie um novo repositório em: https://github.com/new"
Write-Host "   Nome: $repoName"
Write-Host "   NÃO inicialize com README"
Write-Host ""
Write-Host "2. Pressione ENTER quando o repositório estiver criado..."
Read-Host

Write-Host ""
Write-Host "🔧 Configurando git..." -ForegroundColor Cyan

git remote remove origin 2>$null
git remote add origin "https://github.com/$username/$repoName.git"

Write-Host ""
Write-Host "📤 Enviando código para GitHub..." -ForegroundColor Cyan
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deploy realizado com sucesso!" -ForegroundColor Green
    Write-Host "🌐 URL: https://github.com/$username/$repoName"
} else {
    Write-Host ""
    Write-Host "❌ Erro no deploy. Verifique:" -ForegroundColor Red
    Write-Host "   - Se criou o repositório no GitHub"
    Write-Host "   - Suas credenciais do Git"
}

Write-Host ""
Read-Host "Pressione ENTER para sair"
