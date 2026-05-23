// ============================================
// ECOFLOW - Controller Consumo
// ============================================

using EcoFlow.Services;
using Microsoft.AspNetCore.Mvc;

namespace EcoFlow.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ConsumoController : ControllerBase
    {
        private readonly ConsumoService _consumoService;

        public ConsumoController(ConsumoService consumoService)
        {
            _consumoService = consumoService;
        }

        /// <summary>
        /// GET /api/consumo
        /// Parâmetros opcionais:
        ///   - setor: Filtrar por setor
        ///   - dias: Últimos N dias
        /// Retorna: Array de registros de consumo
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetConsumo([FromQuery] string? setor = null, [FromQuery] int dias = 30)
        {
            try
            {
                var consumos = await _consumoService.ObterConsumoAsync(setor, dias);

                var dados = consumos.Select(c => new
                {
                    id = c.Id,
                    setor = c.Setor,
                    data = c.Data.ToString("yyyy-MM-dd"),
                    consumo = c.Consumo,
                    status = c.Status
                }).ToList();

                return Ok(dados);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { erro = ex.Message });
            }
        }

        /// <summary>
        /// POST /api/consumo
        /// Body JSON:
        /// {
        ///     "setor": "string",
        ///     "data": "YYYY-MM-DD",
        ///     "consumo": number
        /// }
        /// Retorna: Registro criado
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> PostConsumo([FromBody] CriarConsumoRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.Setor) || request.Consumo < 0)
                {
                    return BadRequest(new { erro = "Dados inválidos" });
                }

                var data = string.IsNullOrEmpty(request.Data)
                    ? DateTime.Now
                    : DateTime.Parse(request.Data);

                var consumo = await _consumoService.CriarConsumoAsync(request.Setor, request.Consumo, data);

                return StatusCode(201, new
                {
                    id = consumo.Id,
                    setor = consumo.Setor,
                    data = consumo.Data.ToString("yyyy-MM-dd"),
                    consumo = consumo.Consumo,
                    status = consumo.Status,
                    mensagem = "Registro criado com sucesso"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { erro = ex.Message });
            }
        }
    }

    public class CriarConsumoRequest
    {
        public string Setor { get; set; } = string.Empty;
        public double Consumo { get; set; }
        public string? Data { get; set; }
    }
}
