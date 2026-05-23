# 🌿 EcoFlow - Backend em C# / ASP.NET Core

## 📋 Visão Geral

Backend de monitoramento de consumo de energia convertido de Python/Flask para C#/ASP.NET Core com Entity Framework Core.

## 🛠️ Tecnologias

- **Framework**: ASP.NET Core 8.0
- **ORM**: Entity Framework Core 8.0
- **Banco de Dados**: SQLite
- **Documentação**: Swagger/OpenAPI

## 📁 Estrutura do Projeto

```
backend/
├── Controllers/           # Controladores da API
│   ├── ConsumoController.cs
│   ├── EstatisticasController.cs
│   ├── RelatorioController.cs
│   └── StatusController.cs
├── Models/                # Modelos de dados
│   ├── Consumo.cs
│   ├── Setor.cs
│   ├── Log.cs
│   ├── Alerta.cs
│   ├── Usuario.cs
│   └── Relatorio.cs
├── Data/
│   └── EcoFlowDbContext.cs  # Contexto do Entity Framework
├── Services/              # Lógica de negócio
│   ├── ConsumoService.cs
│   └── EstatisticasService.cs
├── Program.cs             # Ponto de entrada e configuração
├── appsettings.json       # Configurações
└── EcoFlow.csproj         # Arquivo de projeto
```

## 🚀 Como Executar

### Pré-requisitos

- .NET 8.0 SDK instalado
- Visual Studio Code ou Visual Studio

### Instalação

1. **Restaurar dependências**
```bash
dotnet restore
```

2. **Executar migrations** (automático na inicialização)
```bash
dotnet ef database update
```

3. **Executar a aplicação**
```bash
dotnet run
```

A API estará disponível em `http://localhost:5000`

## 📚 Endpoints da API

### 1. Status
```
GET /api/status
```
Retorna o status da API.

**Resposta:**
```json
{
  "status": "online",
  "versao": "1.0.0",
  "timestamp": "2024-05-23T10:30:00Z"
}
```

---

### 2. Listar Consumo
```
GET /api/consumo?setor={setor}&dias={dias}
```
Obtém registros de consumo com filtros opcionais.

**Parâmetros:**
- `setor` (opcional): Filtrar por setor específico
- `dias` (opcional, padrão: 30): Últimos N dias

**Resposta:**
```json
[
  {
    "id": 1,
    "setor": "Iluminação",
    "data": "2024-05-20",
    "consumo": 125.5,
    "status": "normal"
  }
]
```

---

### 3. Criar Consumo
```
POST /api/consumo
Content-Type: application/json

{
  "setor": "Iluminação",
  "consumo": 130.0,
  "data": "2024-05-23"
}
```

**Resposta (201 Created):**
```json
{
  "id": 101,
  "setor": "Iluminação",
  "data": "2024-05-23",
  "consumo": 130.0,
  "status": "normal",
  "mensagem": "Registro criado com sucesso"
}
```

---

### 4. Estatísticas
```
GET /api/estatisticas
```
Obtém estatísticas gerais e por setor (média, mediana, moda, total).

**Resposta:**
```json
{
  "geral": {
    "media": 215.3,
    "mediana": 210.0,
    "moda": 205.5,
    "total": 19377.0,
    "quantidade_registros": 90
  },
  "por_setor": {
    "Iluminação": {
      "media": 122.5,
      "total": 3675.0,
      "registros": 30
    },
    "HVAC": {
      "media": 358.3,
      "total": 10749.0,
      "registros": 30
    },
    "Computadores": {
      "media": 189.5,
      "total": 5685.0,
      "registros": 30
    }
  }
}
```

---

### 5. Relatório por Setor
```
GET /api/relatorio/{setor}
```
Gera relatório detalhado de um setor específico.

**Exemplo:**
```
GET /api/relatorio/Iluminação
```

**Resposta:**
```json
{
  "setor": "Iluminação",
  "periodo": {
    "inicio": "2024-04-23T00:00:00",
    "fim": "2024-05-22T00:00:00"
  },
  "consumo": {
    "minimo": 120.0,
    "maximo": 129.0,
    "media": 122.5,
    "mediana": 122.0,
    "moda": 120.5,
    "total": 3675.0
  },
  "registros": 30
}
```

## 🔧 Configuração

### Banco de Dados

O banco SQLite é criado automaticamente em `ecoflow_database.db` no diretório de saída.

### Modificar porta

Em `Program.cs`, altere:
```csharp
app.Run("http://0.0.0.0:5000");
```

### CORS

Por padrão, CORS permite qualquer origem. Para restringir:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("NomeDaPolicy",
        policy =>
        {
            policy.WithOrigins("https://seu-dominio.com")
                .AllowAnyMethod()
                .AllowAnyHeader();
        });
});
```

## 📊 Modelos de Dados

### Consumo
- `id`: Identificador único
- `setor`: Nome do setor
- `data`: Data do consumo
- `consumo`: Valor em kWh
- `status`: normal/alerta/critico
- `criado_em`: Timestamp de criação

### Setor
- `id`: Identificador único
- `nome`: Nome do setor
- `descricao`: Descrição
- `responsavel`: Responsável pelo setor
- `meta_consumo`: Meta de consumo
- `criado_em`: Timestamp de criação

### Usuário
- `id`: Identificador único
- `nome`: Nome do usuário
- `email`: Email (único)
- `cargo`: Cargo
- `ativo`: Status ativo/inativo
- `consentimento_dados`: Conformidade LGPD

### Log
- `id`: Identificador único
- `acao`: Ação executada
- `detalhes`: Detalhes da ação
- `usuario`: Usuário que executou
- `ip_address`: IP da requisição
- `timestamp`: Timestamp da ação

### Alerta
- `id`: Identificador único
- `setor_id`: ID do setor
- `tipo`: Tipo de alerta
- `mensagem`: Mensagem do alerta
- `valor_consumo`: Valor que gerou alerta
- `data_alerta`: Data do alerta
- `resolvido`: Status de resolução

### Relatório
- `id`: Identificador único
- `titulo`: Título do relatório
- `tipo`: Tipo de relatório
- `conteudo`: Conteúdo JSON
- `data_geracao`: Data de geração
- `usuario_gerador_id`: ID do usuário gerador

## 🧮 Funções Estatísticas

### Média Aritmética
$$\bar{x} = \frac{\sum_{i=1}^{n} x_i}{n}$$

### Mediana
Valor central em uma distribuição ordenada. Se quantidade ímpar, é o valor central. Se par, é a média dos dois valores centrais.

### Moda
Valor que aparece com maior frequência no conjunto de dados.

## 🔐 Segurança

- CORS configurado
- Validação de entrada em requisições
- Entity Framework Core previne SQL Injection
- Tratamento de exceções com mensagens seguras

## 📝 Logs

Os logs são armazenados na tabela `logs` do banco de dados para auditoria e conformidade LGPD.

## 🚢 Deploy

### Docker

Crie um `Dockerfile`:

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY bin/Release/net8.0/publish/ .
EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000
ENTRYPOINT ["dotnet", "EcoFlow.dll"]
```

Build e run:
```bash
docker build -t ecoflow-backend .
docker run -p 5000:5000 ecoflow-backend
```

## 📖 Documentação Interativa

Acesse Swagger em: `http://localhost:5000/swagger`

## 🤝 Diferenças Python → C#

| Python | C# |
|--------|-----|
| Flask | ASP.NET Core |
| SQLite3 | EF Core |
| @app.route | [HttpGet/Post] |
| jsonify() | Ok()/StatusCode() |
| request.args | [FromQuery] |
| request.get_json() | [FromBody] |
| datetime | DateTime |

## ❓ Troubleshooting

### Erro: "Database is locked"
- Feche outras conexões ao banco
- Reinicie a aplicação

### Porta 5000 já em uso
- Mude a porta em `Program.cs`
- Ou use: `dotnet run --urls http://localhost:5001`

### Erro ao restaurar dependências
```bash
dotnet nuget locals all --clear
dotnet restore
```

## 📄 Licença

MIT

## 👨‍💻 Autor

Backend convertido de Python para C# em maio de 2024.
