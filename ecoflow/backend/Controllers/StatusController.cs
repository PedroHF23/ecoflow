// ============================================
// ECOFLOW - Controller Status
// ============================================

using Microsoft.AspNetCore.Mvc;

namespace EcoFlow.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StatusController : ControllerBase
    {
        /// <summary>
        /// GET /api/status
        /// Retorna: Status da API
        /// </summary>
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new
            {
                status = "online",
                versao = "1.0.0",
                timestamp = DateTime.Now.ToString("o")
            });
        }
    }
}
