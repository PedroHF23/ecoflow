// ============================================
// ECOFLOW - Serviço de Estatísticas
// ============================================

namespace EcoFlow.Services
{
    public class EstatisticasService
    {
        /// <summary>
        /// Calcula Média Aritmética
        /// Fórmula: Σ(xi) / n
        /// </summary>
        public double CalcularMedia(List<double> valores)
        {
            if (valores == null || valores.Count == 0)
                return 0;

            return valores.Sum() / valores.Count;
        }

        /// <summary>
        /// Calcula Mediana
        /// Valor central em distribuição ordenada
        /// </summary>
        public double CalcularMediana(List<double> valores)
        {
            if (valores == null || valores.Count == 0)
                return 0;

            var valoresOrdenados = valores.OrderBy(v => v).ToList();
            int n = valoresOrdenados.Count;
            int meio = n / 2;

            if (n % 2 == 1)
            {
                // Quantidade ímpar: valor central
                return valoresOrdenados[meio];
            }
            else
            {
                // Quantidade par: média dos dois valores centrais
                return (valoresOrdenados[meio - 1] + valoresOrdenados[meio]) / 2;
            }
        }

        /// <summary>
        /// Calcula Moda
        /// Valor com maior frequência
        /// </summary>
        public double CalcularModa(List<double> valores)
        {
            if (valores == null || valores.Count == 0)
                return 0;

            // Arredondar para encontrar repetições
            var valoresArredondados = valores.Select(v => Math.Round(v, 1)).ToList();

            // Contar frequências usando dicionário
            var frequencias = new Dictionary<double, int>();
            foreach (var valor in valoresArredondados)
            {
                if (frequencias.ContainsKey(valor))
                    frequencias[valor]++;
                else
                    frequencias[valor] = 1;
            }

            // Encontrar valor com maior frequência
            double moda = CalcularMedia(valores);
            int maxFrequencia = 0;

            foreach (var par in frequencias)
            {
                if (par.Value > maxFrequencia)
                {
                    maxFrequencia = par.Value;
                    moda = par.Key;
                }
            }

            return moda;
        }
    }
}
