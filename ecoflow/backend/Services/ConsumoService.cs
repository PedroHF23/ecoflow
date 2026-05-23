// ============================================
// ECOFLOW - Serviço de Consumo
// ============================================

using EcoFlow.Data;
using EcoFlow.Models;
using Microsoft.EntityFrameworkCore;

namespace EcoFlow.Services
{
    public class ConsumoService
    {
        private readonly EcoFlowDbContext _context;
        private readonly EstatisticasService _estatisticasService;

        public ConsumoService(EcoFlowDbContext context)
        {
            _context = context;
            _estatisticasService = new EstatisticasService();
        }

        /// <summary>
        /// Inicializa o banco de dados
        /// Cria tabelas se não existirem
        /// </summary>
        public async Task InicializarBancoAsync()
        {
            await _context.Database.MigrateAsync();
        }

        /// <summary>
        /// Gera dados demonstrativos para teste
        /// Popula banco com 30 dias de dados
        /// </summary>
        public async Task GerarDadosDemonstativosAsync()
        {
            // Verificar se já existe dados
            if (await _context.Consumos.AnyAsync())
            {
                Console.WriteLine("✓ Dados já existem no banco");
                return;
            }

            var setores = new[] { "Iluminação", "HVAC", "Computadores" };
            var dataInicio = DateTime.Now.AddDays(-30);

            for (int i = 0; i < 30; i++)
            {
                var dataAtual = dataInicio.AddDays(i);

                foreach (var setor in setores)
                {
                    // Gerar consumo simulado
                    double consumo = setor switch
                    {
                        "Iluminação" => 120 + (i % 10),
                        "HVAC" => 350 + (i % 20),
                        "Computadores" => 180 + (i % 15),
                        _ => 100
                    };

                    // Determinar status baseado em consumo
                    string status = consumo > 370 ? "critico" :
                                    consumo > 200 ? "alerta" : "normal";

                    var novoConsumo = new Consumo
                    {
                        Setor = setor,
                        Data = dataAtual,
                        Consumo = consumo,
                        Status = status
                    };

                    _context.Consumos.Add(novoConsumo);
                }
            }

            await _context.SaveChangesAsync();
            Console.WriteLine($"✓ {30 * setores.Length} registros de consumo gerados");
        }

        /// <summary>
        /// Obter registros de consumo com filtros
        /// </summary>
        public async Task<List<Consumo>> ObterConsumoAsync(string? setor = null, int dias = 30)
        {
            var dataLimite = DateTime.Now.AddDays(-dias);

            IQueryable<Consumo> query = _context.Consumos
                .Where(c => c.Data >= dataLimite)
                .OrderByDescending(c => c.Data);

            if (!string.IsNullOrEmpty(setor))
            {
                query = query.Where(c => c.Setor == setor);
            }

            return await query.ToListAsync();
        }

        /// <summary>
        /// Criar novo registro de consumo
        /// </summary>
        public async Task<Consumo> CriarConsumoAsync(string setor, double consumo, DateTime? data = null)
        {
            data ??= DateTime.Now;

            // Determinar status
            string status = consumo > 370 ? "critico" :
                            consumo > 200 ? "alerta" : "normal";

            var novoConsumo = new Consumo
            {
                Setor = setor,
                Data = data.Value,
                Consumo = consumo,
                Status = status
            };

            _context.Consumos.Add(novoConsumo);
            await _context.SaveChangesAsync();

            return novoConsumo;
        }

        /// <summary>
        /// Obter estatísticas gerais e por setor
        /// </summary>
        public async Task<object> ObterEstatisticasAsync()
        {
            var consumos = await _context.Consumos.ToListAsync();

            if (!consumos.Any())
            {
                return new
                {
                    mensagem = "Sem dados para análise",
                    media = 0,
                    mediana = 0,
                    moda = 0,
                    total = 0
                };
            }

            var valores = consumos.Select(c => c.Consumo).ToList();

            // Calcular estatísticas gerais
            var media = _estatisticasService.CalcularMedia(valores);
            var mediana = _estatisticasService.CalcularMediana(valores);
            var moda = _estatisticasService.CalcularModa(valores);
            var total = valores.Sum();

            // Estatísticas por setor
            var setores = await _context.Consumos
                .Select(c => c.Setor)
                .Distinct()
                .ToListAsync();

            var statsPorSetor = new Dictionary<string, object>();
            foreach (var setor in setores)
            {
                var consumosSetor = consumos
                    .Where(c => c.Setor == setor)
                    .Select(c => c.Consumo)
                    .ToList();

                statsPorSetor[setor] = new
                {
                    media = Math.Round(_estatisticasService.CalcularMedia(consumosSetor), 2),
                    total = Math.Round(consumosSetor.Sum(), 2),
                    registros = consumosSetor.Count
                };
            }

            return new
            {
                geral = new
                {
                    media = Math.Round(media, 2),
                    mediana = Math.Round(mediana, 2),
                    moda = Math.Round(moda, 2),
                    total = Math.Round(total, 2),
                    quantidade_registros = valores.Count
                },
                por_setor = statsPorSetor
            };
        }

        /// <summary>
        /// Gerar relatório detalhado do setor
        /// </summary>
        public async Task<object?> GerarRelatorioSetorAsync(string setor)
        {
            var consumos = await _context.Consumos
                .Where(c => c.Setor == setor)
                .OrderBy(c => c.Data)
                .ToListAsync();

            if (!consumos.Any())
                return null;

            var valores = consumos.Select(c => c.Consumo).ToList();

            return new
            {
                setor = setor,
                periodo = new
                {
                    inicio = consumos.First().Data,
                    fim = consumos.Last().Data
                },
                consumo = new
                {
                    minimo = Math.Round(valores.Min(), 2),
                    maximo = Math.Round(valores.Max(), 2),
                    media = Math.Round(_estatisticasService.CalcularMedia(valores), 2),
                    mediana = Math.Round(_estatisticasService.CalcularMediana(valores), 2),
                    moda = Math.Round(_estatisticasService.CalcularModa(valores), 2),
                    total = Math.Round(valores.Sum(), 2)
                },
                registros = valores.Count
            };
        }
    }
}
