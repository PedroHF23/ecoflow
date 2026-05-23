// ============================================
// ECOFLOW - Modelo Consumo
// ============================================

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcoFlow.Models
{
    [Table("consumo")]
    public class Consumo
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("setor")]
        [Required]
        public string Setor { get; set; } = string.Empty;

        [Column("data")]
        [Required]
        public DateTime Data { get; set; }

        [Column("consumo")]
        [Required]
        public double Consumo { get; set; }

        [Column("status")]
        public string Status { get; set; } = "normal";

        [Column("criado_em")]
        public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    }
}
