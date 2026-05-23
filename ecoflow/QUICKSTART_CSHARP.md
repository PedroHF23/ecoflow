# 🌿 EcoFlow - Guia de Início Rápido (C# Backend)

## ✅ Pré-requisitos

- **Windows/Mac/Linux**
- **.NET 8.0 SDK** ([Download](https://dotnet.microsoft.com/download))
- **Visual Studio Code** ou **Visual Studio** (opcional)

## 🚀 Quick Start

### 1️⃣ Verificar Instalação do .NET

```bash
dotnet --version
```

Você deve ver algo como: `8.0.x`

### 2️⃣ Setup Automático

**Windows:**
```cmd
setup-csharp.bat
```

**macOS/Linux:**
```bash
bash setup-csharp.sh
```

### 3️⃣ Setup Manual (se preferir)

```bash
# Navegar para o backend
cd backend

# Restaurar dependências
dotnet restore

# Compilar projeto
dotnet build

# Executar
dotnet run
```

### 4️⃣ Testar a API

Em outro terminal:

```bash
# Verificar status
curl http://localhost:5000/api/status

# Obter consumos
curl http://localhost:5000/api/consumo

# Obter estatísticas
curl http://localhost:5000/api/estatisticas

# Obter relatório de um setor
curl http://localhost:5000/api/relatorio/Iluminação
```

### 5️⃣ Acessar Swagger (Documentação Interativa)

Abra no navegador:
```
http://localhost:5000/swagger
```

## 📁 Estrutura do Projeto

```
ecoflow/
├── backend/                    # Backend C#/ASP.NET Core
│   ├── Controllers/            # APIs REST
│   ├── Models/                 # Modelos de dados
│   ├── Data/                   # Entity Framework DbContext
│   ├── Services/               # Lógica de negócio
│   ├── Program.cs              # Ponto de entrada
│   ├── appsettings.json        # Configurações
│   └── EcoFlow.csproj          # Arquivo de projeto
├── frontend/                   # Frontend HTML/CSS/JS (intacto)
│   ├── index.html
│   ├── style.css
│   └── script.js
└── docs/                       # Documentação
    └── ARQUITETURA.md
```

## 🛠️ Desenvolvimento

### Abrir no Visual Studio Code

```bash
code .
```

### Extensões Recomendadas
- C# (by Microsoft)
- REST Client (para testar APIs)
- Swagger Viewer

### Debug

Pressione `F5` ou execute:
```bash
dotnet run --configuration Debug
```

## 📚 Documentação

- **[README_CSHARP.md](backend/README_CSHARP.md)** - Documentação técnica completa
- **[MIGRACAO_PYTHON_CSHARP.md](MIGRACAO_PYTHON_CSHARP.md)** - Guia de migração
- **[ARQUITETURA.md](docs/ARQUITETURA.md)** - Arquitetura do sistema

## 🔍 Endpoints Disponíveis

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/status` | Status da API |
| GET | `/api/consumo` | Listar consumos |
| POST | `/api/consumo` | Criar consumo |
| GET | `/api/estatisticas` | Cálculos estatísticos |
| GET | `/api/relatorio/{setor}` | Relatório do setor |

## 💡 Exemplos de Uso

### Criar um novo consumo

```bash
curl -X POST http://localhost:5000/api/consumo \
  -H "Content-Type: application/json" \
  -d '{
    "setor": "Iluminação",
    "consumo": 135.5,
    "data": "2024-05-23"
  }'
```

### Filtrar consumo por setor

```bash
curl "http://localhost:5000/api/consumo?setor=Iluminação&dias=7"
```

## ⚙️ Configuração

### Modificar Porta

Em `backend/Program.cs`:
```csharp
app.Run("http://0.0.0.0:5000");  // Mude 5000 para sua porta
```

### Modificar Banco de Dados

Em `backend/Program.cs`:
```csharp
var dbPath = Path.Combine(AppContext.BaseDirectory, "seu-banco.db");
```

## 🐳 Docker (Opcional)

### Build da imagem

```bash
docker build -f backend/Dockerfile -t ecoflow-backend .
```

### Run com Docker

```bash
docker run -p 5000:5000 ecoflow-backend
```

## 🚀 Deploy em Produção

### Publicar a aplicação

```bash
dotnet publish -c Release
```

Arquivos publicados estarão em `backend/bin/Release/net8.0/publish/`

### Usar IIS (Windows)

1. Publique para Release
2. Configure um app pool no IIS
3. Aponte para a pasta publicada

## ⚠️ Troubleshooting

### Erro: "Porta 5000 já em uso"

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

### Erro: ".NET SDK não encontrado"

Instale do [site oficial](https://dotnet.microsoft.com/download)

### Erro: "Database is locked"

- Feche outras instâncias
- Delete `ecoflow_database.db` para resetar
- Execute novamente

### Verificar versão do .NET

```bash
dotnet --info
```

## 📞 Suporte

Para problemas, verificar:
1. Logs do console durante execução
2. Swagger: `http://localhost:5000/swagger`
3. [Stack Overflow](https://stackoverflow.com/questions/tagged/asp.net-core)

## ✨ Próximas Etapas

- [ ] Configurar autenticação JWT
- [ ] Adicionar testes unitários
- [ ] Configurar CI/CD
- [ ] Deployar em produção
- [ ] Monitoramento com Application Insights

## 📝 Notas

- O banco SQLite é criado automaticamente
- Dados demonstrativos são gerados na primeira execução
- CORS está habilitado por padrão

---

**Boa sorte! 🚀**
