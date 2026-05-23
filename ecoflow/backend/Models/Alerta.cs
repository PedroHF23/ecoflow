// ============================================
// ECOFLOW - Modelo Alerta
// ============================================

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcoFlow.Models
{
    [Table("alertas")]
    public class Alerta
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("setor_id")]
        [Required]
        public int SetorId { get; set; }

        [Column("tipo")]
        [Required]
        public string Tipo { get; set; } = string.Empty;

        [Column("mensagem")]
        public string? Mensagem { get; set; }

        [Column("valor_consumo")]
        public double? ValorConsumo { get; set; }

        [Column("data_alerta")]
        public DateTime DataAlerta { get; set; } = DateTime.UtcNow;

        [Column("resolvido")]
        public bool Resolvido { get; set; } = false;
    }
}
