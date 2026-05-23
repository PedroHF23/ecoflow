// ============================================
// ECOFLOW - Controller Relatório
// ============================================

using EcoFlow.Services;
using Microsoft.AspNetCore.Mvc;

namespace EcoFlow.Controllers
{
    [ApiController]
    [Route("api/relatorio")]
    public class RelatorioController : ControllerBase
    {
        private readonly ConsumoService _consumoService;

        public RelatorioController(ConsumoService consumoService)
        {
            _consumoService = consumoService;
        }

        /// <summary>
        /// GET /api/relatorio/{setor}
        /// Parâmetro: setor (string)
        /// Retorna: Relatório detalhado do setor
        /// </summary>
        [HttpGet("{setor}")]
        public async Task<IActionResult> GetRelatorioSetor(string setor)
        {
            try
            {
                var relatorio = await _consumoService.GerarRelatorioSetorAsync(setor);

                if (relatorio == null)
                {
                    return NotFound(new { erro = "Setor não encontrado" });
                }

                return Ok(relatorio);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { erro = ex.Message });
            }
        }
    }
}
