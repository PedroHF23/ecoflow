// ============================================
// ECOFLOW - Modelo Relatorio
// ============================================

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcoFlow.Models
{
    [Table("relatorios")]
    public class Relatorio
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("titulo")]
        [Required]
        public string Titulo { get; set; } = string.Empty;

        [Column("tipo")]
        public string? Tipo { get; set; }

        [Column("conteudo")]
        public string? Conteudo { get; set; }

        [Column("data_geracao")]
        public DateTime DataGeracao { get; set; } = DateTime.UtcNow;

        [Column("usuario_gerador_id")]
        public int? UsuarioGeradorId { get; set; }
    }
}
