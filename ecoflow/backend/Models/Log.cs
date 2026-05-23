// ============================================
// ECOFLOW - Modelo Log
// ============================================

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcoFlow.Models
{
    [Table("logs")]
    public class Log
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("acao")]
        [Required]
        public string Acao { get; set; } = string.Empty;

        [Column("detalhes")]
        public string? Detalhes { get; set; }

        [Column("usuario")]
        public string? Usuario { get; set; }

        [Column("ip_address")]
        public string? IpAddress { get; set; }

        [Column("timestamp")]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
