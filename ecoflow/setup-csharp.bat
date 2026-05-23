@echo off
REM ============================================
REM ECOFLOW - Setup do Backend em C#
REM ============================================

echo.
echo ================================================
echo 🌿 EcoFlow - Setup Backend C#/ASP.NET Core
echo ================================================
echo.

REM Verificar se .NET está instalado
dotnet --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ .NET SDK não encontrado!
    echo    Baixe em: https://dotnet.microsoft.com/download
    pause
    exit /b 1
)

echo ✓ .NET SDK encontrado: 
dotnet --version

REM Navegar para o diretório do backend
cd backend

echo.
echo 📦 Restaurando dependências...
dotnet restore

if %ERRORLEVEL% neq 0 (
    echo ❌ Erro ao restaurar dependências
    pause
    exit /b 1
)

echo ✓ Dependências restauradas

echo.
echo 🔨 Compilando projeto...
dotnet build

if %ERRORLEVEL% neq 0 (
    echo ❌ Erro ao compilar
    pause
    exit /b 1
)

echo ✓ Projeto compilado com sucesso

echo.
echo ================================================
echo ✅ Setup concluído!
echo ================================================
echo.
echo Para executar a aplicação:
echo   cd backend
echo   dotnet run
echo.
echo A API estará em: http://localhost:5000
echo Swagger estará em: http://localhost:5000/swagger
echo.
pause
