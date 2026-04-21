# Vercel Deployment Helper Script
# Usage: .\deploy-vercel.ps1

Write-Host "🚀 Preparing Vercel Deployment..." -ForegroundColor Cyan

# 1. Check for Vercel CLI
if (!(Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
}

# 2. Deploy to Vercel
Write-Host "📦 Deploying to Vercel (Production)..." -ForegroundColor Green
vercel deploy --prod

Write-Host "`n✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "Remember to add your environment variables in the Vercel Dashboard:" -ForegroundColor Yellow
Write-Host "1. DATABASE_URL (Use the 6543 Pooler URL)"
Write-Host "2. OLLAMA_URL (Your ngrok URL)"
Write-Host "3. OLLAMA_MODEL (deepseek-v3.1:671b-cloud)"
Write-Host "4. LI_SESSION (Your captured session)"
Write-Host "5. OUTREACH_SECRET (Your API secret)"
