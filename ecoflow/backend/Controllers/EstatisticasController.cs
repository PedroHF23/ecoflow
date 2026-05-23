// ============================================
// ECOFLOW - Controller Estatísticas
// ============================================

using EcoFlow.Services;
using Microsoft.AspNetCore.Mvc;

namespace EcoFlow.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EstatisticasController : ControllerBase
    {
        private readonly ConsumoService _consumoService;

        public EstatisticasController(ConsumoService consumoService)
        {
            _consumoService = consumoService;
        }

        /// <summary>
        /// GET /api/estatisticas
        /// Calcula: Média, Mediana, Moda
        /// Retorna: Objeto com estatísticas
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            try
            {
                var resultado = await _consumoService.ObterEstatisticasAsync();
                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { erro = ex.Message });
            }
        }
    }
}
