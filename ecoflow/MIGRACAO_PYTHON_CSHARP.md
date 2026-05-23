# 📋 Guia de Migração: Python → C#

## Resumo da Conversão

Este documento descreve a migração completa do backend de Python/Flask para C#/ASP.NET Core.

## 🔄 Mudanças Principais

### 1. Framework Web

| Python | C# |
|--------|-----|
| Flask 2.3.2 | ASP.NET Core 8.0 |
| Flask-CORS | CORS integrado |
| Python 3.x | .NET 8.0 |

### 2. Acesso a Banco de Dados

| Python | C# |
|--------|-----|
| sqlite3 (driver direto) | Entity Framework Core |
| Queries SQL manuais | LINQ/EF Core |
| Conexão manual (conectar_banco) | DbContext injetado |
| Row factory | Mapeamento automático |

### 3. Estrutura de Código

#### Python (Antes)
```python
from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route('/api/consumo', methods=['GET'])
def obter_consumo():
    conexao = conectar_banco()
    cursor = conexao.cursor()
    cursor.execute('SELECT ...')
    return jsonify(dados)
```

#### C# (Depois)
```csharp
[ApiController]
[Route("api/[controller]")]
public class ConsumoController : ControllerBase
{
    private readonly ConsumoService _consumoService;
    
    public ConsumoController(ConsumoService service)
    {
        _consumoService = service;
    }
    
    [HttpGet]
    public async Task<IActionResult> GetConsumo()
    {
        var dados = await _consumoService.ObterConsumoAsync();
        return Ok(dados);
    }
}
```

### 4. Funções de Cálculo

| Python | C# |
|--------|-----|
| Funções modulares | Service class methods |
| `calcular_media()` | `CalcularMedia()` |
| Sem type hints | Type hints obrigatórios |

### 5. Modelos de Dados

#### Python (Antes)
```python
# Dados em dicionários
dados.append({
    'id': reg['id'],
    'setor': reg['setor'],
    'consumo': reg['consumo']
})
```

#### C# (Depois)
```csharp
// Classes tipadas com Entity Framework
[Table("consumo")]
public class Consumo
{
    [Key]
    [Column("id")]
    public int Id { get; set; }
    
    [Column("setor")]
    public string Setor { get; set; }
}
```

## 📦 Dependências

### Antes (Python)
```
Flask==2.3.2
Flask-CORS==4.0.0
python-dotenv==1.0.0
Werkzeug==2.3.6
```

### Depois (C# / .NET)
```xml
<PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0.0" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Sqlite" Version="8.0.0" />
<PackageReference Include="Swashbuckle.AspNetCore" Version="6.4.6" />
```

## 🗂️ Estrutura de Diretórios

### Antes
```
backend/
├── main.py
├── database.sql
└── requirements.txt
```

### Depois
```
backend/
├── Controllers/           # APIs REST
├── Models/               # Entidades
├── Data/                 # DbContext
├── Services/             # Lógica de negócio
├── Program.cs            # Configuração
├── appsettings.json      # Configurações
└── EcoFlow.csproj        # Projeto
```

## 🔑 Conceitos Equivalentes

### Inicialização

#### Python
```python
if __name__ == '__main__':
    inicializar_banco()
    gerar_dados_demonstrativos()
    app.run(host='0.0.0.0', port=5000)
```

#### C#
```csharp
using (var scope = app.Services.CreateScope())
{
    var service = scope.ServiceProvider.GetRequiredService<ConsumoService>();
    await service.InicializarBancoAsync();
    await service.GerarDadosDemonstativosAsync();
}
app.Run("http://0.0.0.0:5000");
```

### Tratamento de Erros

#### Python
```python
@app.errorhandler(404)
def nao_encontrado(erro):
    return jsonify({'erro': 'Não encontrado'}), 404
```

#### C#
```csharp
[HttpGet("{setor}")]
public async Task<IActionResult> GetRelatorio(string setor)
{
    var resultado = await _service.BuscarAsync(setor);
    if (resultado == null)
        return NotFound(new { erro = "Não encontrado" });
    return Ok(resultado);
}
```

### Query ao Banco

#### Python
```python
cursor.execute('''
    SELECT * FROM consumo WHERE setor = ? AND data >= ?
''', (setor, data_limite))
registros = cursor.fetchall()
```

#### C#
```csharp
var registros = await _context.Consumos
    .Where(c => c.Setor == setor && c.Data >= dataLimite)
    .ToListAsync();
```

## 🚀 Vantagens da Migração

✅ **Type Safety**: C# é fortemente tipado
✅ **Performance**: ASP.NET Core é mais rápido que Flask
✅ **ORM Integrada**: Entity Framework Core
✅ **Tooling**: Visual Studio com IntelliSense completo
✅ **Scalability**: Melhor para aplicações maiores
✅ **Async/Await**: Melhor suporte nativo
✅ **Injeção de Dependência**: Built-in
✅ **Documentação**: Swagger automático

## ⚠️ Considerações Importantes

1. **Async/Await**: C# usa padrão async/await (python também suporta)
2. **Database Migrations**: EF Core gerencia schema automaticamente
3. **CORS**: Padrão diferente, mas mais seguro por padrão
4. **Testing**: Frameworks diferentes (xUnit, NUnit para C#)
5. **Deployment**: Requer .NET runtime

## 📝 Checklist de Migração

- ✅ Modelos de dados convertidos
- ✅ DbContext configurado
- ✅ Services implementados
- ✅ Controllers criados
- ✅ Endpoints testados
- ✅ Funções estatísticas convertidas
- ✅ Banco de dados migrado
- ✅ CORS configurado
- ✅ Documentação atualizada
- ✅ Dados demonstrativos preservados

## 🧪 Testando a Migração

```bash
# 1. Restaurar dependências
dotnet restore

# 2. Executar
dotnet run

# 3. Testar um endpoint
curl http://localhost:5000/api/status

# 4. Swagger
# Acesse http://localhost:5000/swagger
```

## 🔗 Referências

- [ASP.NET Core Documentation](https://docs.microsoft.com/aspnet/core)
- [Entity Framework Core](https://docs.microsoft.com/ef/core)
- [C# Documentation](https://docs.microsoft.com/dotnet/csharp)
- [Entity Framework Core Migrations](https://docs.microsoft.com/ef/core/managing-schemas/migrations)

## ❓ Suporte

Para dúvidas sobre a migração, verifique:
1. README_CSHARP.md - Documentação técnica completa
2. Controllers/ - Exemplos de implementação
3. Services/ - Lógica de negócio
4. Models/ - Estrutura de dados
