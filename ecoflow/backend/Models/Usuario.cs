// ============================================
// ECOFLOW - Modelo Usuario
// ============================================

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcoFlow.Models
{
    [Table("usuarios")]
    public class Usuario
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("nome")]
        [Required]
        public string Nome { get; set; } = string.Empty;

        [Column("email")]
        [Required]
        public string Email { get; set; } = string.Empty;

        [Column("cargo")]
        public string? Cargo { get; set; }

        [Column("ativo")]
        public bool Ativo { get; set; } = true;

        [Column("consentimento_dados")]
        public bool ConsentimentoDados { get; set; } = false;

        [Column("data_cadastro")]
        public DateTime DataCadastro { get; set; } = DateTime.UtcNow;

        [Column("ultima_atualizacao")]
        public DateTime? UltimaAtualizacao { get; set; }
    }
}
