// ============================================
// ECOFLOW - Database Context
// ============================================

using Microsoft.EntityFrameworkCore;
using EcoFlow.Models;

namespace EcoFlow.Data
{
    public class EcoFlowDbContext : DbContext
    {
        public EcoFlowDbContext(DbContextOptions<EcoFlowDbContext> options)
            : base(options)
        {
        }

        public DbSet<Consumo> Consumos { get; set; }
        public DbSet<Setor> Setores { get; set; }
        public DbSet<Log> Logs { get; set; }
        public DbSet<Alerta> Alertas { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Relatorio> Relatorios { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Índices
            modelBuilder.Entity<Consumo>()
                .HasIndex(c => c.Setor)
                .HasDatabaseName("idx_consumo_setor");

            modelBuilder.Entity<Consumo>()
                .HasIndex(c => c.Data)
                .HasDatabaseName("idx_consumo_data");

            modelBuilder.Entity<Consumo>()
                .HasIndex(c => c.Status)
                .HasDatabaseName("idx_consumo_status");

            modelBuilder.Entity<Log>()
                .HasIndex(l => l.Timestamp)
                .HasDatabaseName("idx_logs_timestamp");

            modelBuilder.Entity<Alerta>()
                .HasIndex(a => a.SetorId)
                .HasDatabaseName("idx_alertas_setor_id");

            modelBuilder.Entity<Usuario>()
                .HasIndex(u => u.Email)
                .HasDatabaseName("idx_usuarios_email");

            // Dados iniciais
            modelBuilder.Entity<Setor>().HasData(
                new Setor { Id = 1, Nome = "Iluminação", Descricao = "Sistema de iluminação geral do prédio", Responsavel = "João Silva", MetaConsumo = 125.0 },
                new Setor { Id = 2, Nome = "HVAC", Descricao = "Sistema de climatização (Aquecimento, Ventilação, Ar Condicionado)", Responsavel = "Maria Santos", MetaConsumo = 360.0 },
                new Setor { Id = 3, Nome = "Computadores", Descricao = "Sala de servidores e computadores", Responsavel = "Pedro Oliveira", MetaConsumo = 185.0 },
                new Setor { Id = 4, Nome = "Cozinha", Descricao = "Cozinha e refeitório", Responsavel = "Ana Costa", MetaConsumo = 95.0 },
                new Setor { Id = 5, Nome = "Limpeza", Descricao = "Equipamentos de limpeza", Responsavel = "Carlos Ferreira", MetaConsumo = 55.0 }
            );
        }
    }
}
