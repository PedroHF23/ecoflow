#!/bin/bash
# ============================================
# ECOFLOW - Setup do Backend em C#
# ============================================

echo "================================================"
echo "🌿 EcoFlow - Setup Backend C#/ASP.NET Core"
echo "================================================"

# Verificar se .NET está instalado
if ! command -v dotnet &> /dev/null; then
    echo "❌ .NET SDK não encontrado!"
    echo "   Baixe em: https://dotnet.microsoft.com/download"
    exit 1
fi

echo "✓ .NET SDK encontrado: $(dotnet --version)"

# Navegar para o diretório do backend
cd "$(dirname "$0")/backend"

echo ""
echo "📦 Restaurando dependências..."
dotnet restore

if [ $? -ne 0 ]; then
    echo "❌ Erro ao restaurar dependências"
    exit 1
fi

echo "✓ Dependências restauradas"

echo ""
echo "🔨 Compilando projeto..."
dotnet build

if [ $? -ne 0 ]; then
    echo "❌ Erro ao compilar"
    exit 1
fi

echo "✓ Projeto compilado com sucesso"

echo ""
echo "================================================"
echo "✅ Setup concluído!"
echo "================================================"
echo ""
echo "Para executar a aplicação:"
echo "  cd backend"
echo "  dotnet run"
echo ""
echo "A API estará em: http://localhost:5000"
echo "Swagger estará em: http://localhost:5000/swagger"
echo ""
