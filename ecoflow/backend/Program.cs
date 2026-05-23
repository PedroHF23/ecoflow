// ============================================
// ECOFLOW - Configuração Principal
// Framework: ASP.NET Core
// Banco: SQLite/SQL
// ============================================

using Microsoft.EntityFrameworkCore;
using EcoFlow.Data;
using EcoFlow.Services;

var builder = WebApplicationBuilder.CreateBuilder(args);

// ============ CONFIGURAÇÃO DE SERVIÇOS ============

// Adicionar serviços de banco de dados
var dbPath = Path.Combine(AppContext.BaseDirectory, "ecoflow_database.db");
builder.Services.AddDbContext<EcoFlowDbContext>(options =>
    options.UseSqlite($"Data Source={dbPath}")
);

// Adicionar serviços de aplicação
builder.Services.AddScoped<ConsumoService>();
builder.Services.AddScoped<EstatisticasService>();

// Adicionar controllers
builder.Services.AddControllers();

// Adicionar CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(
        policy =>
        {
            policy.AllowAnyOrigin()
                .AllowAnyMethod()
                .AllowAnyHeader();
        });
});

// Adicionar Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// ============ PIPELINE HTTP ============

// Habilitar Swagger em desenvolvimento
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Habilitar HTTPS redirection em produção
// app.UseHttpsRedirection();

// Habilitar CORS
app.UseCors();

// Mapear controllers
app.MapControllers();

// ============ INICIALIZAÇÃO ============

// Scope para injeção de dependência
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var consumoService = services.GetRequiredService<ConsumoService>();

    try
    {
        Console.WriteLine("=".PadRight(50, '='));
        Console.WriteLine("🌿 EcoFlow - Backend de Monitoramento");
        Console.WriteLine("=".PadRight(50, '='));

        // Inicializar banco de dados
        await consumoService.InicializarBancoAsync();

        // Gerar dados demonstrativos
        await consumoService.GerarDadosDemonstativosAsync();

        Console.WriteLine("\n📚 Endpoints disponíveis:");
        Console.WriteLine("  GET  /api/status            - Status da API");
        Console.WriteLine("  GET  /api/consumo           - Lista de consumo");
        Console.WriteLine("  POST /api/consumo           - Criar consumo");
        Console.WriteLine("  GET  /api/estatisticas      - Cálculos estatísticos");
        Console.WriteLine("  GET  /api/relatorio/{setor} - Relatório por setor");
        Console.WriteLine("\n🚀 Servidor iniciando em http://localhost:5000");
        Console.WriteLine("📖 Swagger disponível em http://localhost:5000/swagger");
        Console.WriteLine("=".PadRight(50, '=') + "\n");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Erro ao inicializar: {ex.Message}");
    }
}

// ============ EXECUTAR ============

app.Run("http://0.0.0.0:5000");
