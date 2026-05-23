// ============================================
// ECOFLOW - Script de Interatividade
// Consumo de API, Cálculos Estatísticos, DOM
// ============================================

// Configuração de API
const API_BASE_URL = 'http://localhost:5000/api';

// Dados em cache
let dadosConsumoCacheado = [];

/**
 * Função: Inicializar aplicação
 * Carrega dados ao abrir a página
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('✓ EcoFlow carregado com sucesso');
    carregarDados();
    configurarEventos();
});

/**
 * Função: Configurar eventos do DOM
 * Define listeners para botões e filtros
 */
function configurarEventos() {
    const filterInput = document.getElementById('filterInput');
    
    if (filterInput) {
        filterInput.addEventListener('input', (e) => {
            filtrarDadosTabela(e.target.value);
        });
    }
}

/**
 * Função: Carregar dados da API
 * Requisição GET para obter dados de consumo
 */
async function carregarDados() {
    try {
        console.log('📡 Conectando à API...');
        
        // Requisição para backend
        const resposta = await fetch(`${API_BASE_URL}/consumo`);
        
        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }
        
        const dados = await resposta.json();
        dadosConsumoCacheado = dados;
        
        console.log('✓ Dados carregados:', dados);
        
        // Atualizar interface
        atualizarDashboard(dados);
        preencherTabela(dados);
        gerarRelatorios(dados);
        
    } catch (erro) {
        console.error('✗ Erro ao carregar dados:', erro);
        // Usar dados demonstrativos se API falhar
        usarDadosDemonstrativos();
    }
}

/**
 * Função: Usar dados demonstrativos (fallback)
 * Quando API não está disponível, usa dados mock
 */
function usarDadosDemonstrativos() {
    console.log('⚠️  Usando dados demonstrativos');
    
    const dadosMock = [
        { setor: 'Iluminação', data: '2026-05-01', consumo: 120.5, status: 'normal' },
        { setor: 'HVAC', data: '2026-05-02', consumo: 350.8, status: 'normal' },
        { setor: 'Computadores', data: '2026-05-03', consumo: 180.2, status: 'alerta' },
        { setor: 'Iluminação', data: '2026-05-04', consumo: 125.0, status: 'normal' },
        { setor: 'HVAC', data: '2026-05-05', consumo: 360.5, status: 'critico' },
        { setor: 'Computadores', data: '2026-05-06', consumo: 175.8, status: 'normal' },
        { setor: 'Iluminação', data: '2026-05-07', consumo: 118.3, status: 'normal' },
        { setor: 'HVAC', data: '2026-05-08', consumo: 345.2, status: 'normal' },
        { setor: 'Computadores', data: '2026-05-09', consumo: 185.5, status: 'alerta' },
        { setor: 'Iluminação', data: '2026-05-10', consumo: 122.7, status: 'normal' },
        { setor: 'HVAC', data: '2026-05-11', consumo: 355.0, status: 'alerta' },
        { setor: 'Computadores', data: '2026-05-12', consumo: 178.9, status: 'normal' },
        { setor: 'Iluminação', data: '2026-05-13', consumo: 121.4, status: 'normal' },
        { setor: 'HVAC', data: '2026-05-14', consumo: 358.3, status: 'normal' },
        { setor: 'Computadores', data: '2026-05-15', consumo: 182.1, status: 'alerta' },
        { setor: 'Iluminação', data: '2026-05-16', consumo: 119.6, status: 'normal' },
        { setor: 'HVAC', data: '2026-05-17', consumo: 352.5, status: 'critico' },
        { setor: 'Computadores', data: '2026-05-18', consumo: 180.0, status: 'normal' },
        { setor: 'Iluminação', data: '2026-05-19', consumo: 123.2, status: 'normal' },
        { setor: 'HVAC', data: '2026-05-20', consumo: 361.8, status: 'normal' }
    ];
    
    dadosConsumoCacheado = dadosMock;
    atualizarDashboard(dadosMock);
    preencherTabela(dadosMock);
    gerarRelatorios(dadosMock);
}

/**
 * Função: Atualizar Dashboard com Métricas
 * Calcula Média, Mediana e Moda
 * @param {Array} dados - Array de registros de consumo
 */
function atualizarDashboard(dados) {
    if (!dados || dados.length === 0) return;
    
    // Extrair valores de consumo
    const valores = dados.map(d => d.consumo).sort((a, b) => a - b);
    
    // MÉDIA
    const media = calcularMedia(valores);
    
    // MEDIANA
    const mediana = calcularMediana(valores);
    
    // MODA
    const moda = calcularModa(valores);
    
    // TOTAL
    const total = valores.reduce((acc, val) => acc + val, 0);
    
    // Atualizar DOM
    document.getElementById('mediaConsumo').textContent = media.toFixed(2) + ' kWh';
    document.getElementById('medianaConsumo').textContent = mediana.toFixed(2) + ' kWh';
    document.getElementById('modaConsumo').textContent = moda.toFixed(2) + ' kWh';
    document.getElementById('totalConsumo').textContent = total.toFixed(2) + ' kWh';
    
    console.log('📊 Métricas calculadas:');
    console.log(`  Média: ${media.toFixed(2)} kWh`);
    console.log(`  Mediana: ${mediana.toFixed(2)} kWh`);
    console.log(`  Moda: ${moda.toFixed(2)} kWh`);
}

/**
 * Função: Calcular Média Aritmética
 * @param {Array} valores - Array de números
 * @returns {Number} Média dos valores
 */
function calcularMedia(valores) {
    if (valores.length === 0) return 0;
    const soma = valores.reduce((acc, val) => acc + val, 0);
    return soma / valores.length;
}

/**
 * Função: Calcular Mediana
 * Valor central em distribuição ordenada
 * @param {Array} valores - Array de números ordenados
 * @returns {Number} Mediana dos valores
 */
function calcularMediana(valores) {
    if (valores.length === 0) return 0;
    
    const meio = Math.floor(valores.length / 2);
    
    if (valores.length % 2 !== 0) {
        return valores[meio];
    } else {
        return (valores[meio - 1] + valores[meio]) / 2;
    }
}

/**
 * Função: Calcular Moda
 * Valor com maior frequência
 * @param {Array} valores - Array de números
 * @returns {Number} Moda dos valores (ou média se sem repetição)
 */
function calcularModa(valores) {
    if (valores.length === 0) return 0;
    
    // Arredondar para 1 casa decimal para encontrar repetições
    const valoresArredondados = valores.map(v => Math.round(v * 10) / 10);
    
    // Contar frequências
    const frequencias = {};
    valoresArredondados.forEach(val => {
        frequencias[val] = (frequencias[val] || 0) + 1;
    });
    
    // Encontrar valor com maior frequência
    let maxFreq = 0;
    let moda = calcularMedia(valores);
    
    for (let valor in frequencias) {
        if (frequencias[valor] > maxFreq) {
            maxFreq = frequencias[valor];
            moda = parseFloat(valor);
        }
    }
    
    return moda;
}

/**
 * Função: Preencher Tabela de Dados
 * @param {Array} dados - Array de registros
 */
function preencherTabela(dados) {
    const tableBody = document.getElementById('tableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    dados.forEach(item => {
        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td>${item.setor}</td>
            <td>${formatarData(item.data)}</td>
            <td>${item.consumo.toFixed(2)} kWh</td>
            <td>
                <span class="status-badge ${item.status}">
                    ${item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </span>
            </td>
        `;
        tableBody.appendChild(linha);
    });
}

/**
 * Função: Filtrar dados na tabela
 * @param {String} filtro - Texto a buscar
 */
function filtrarDadosTabela(filtro) {
    const filtered = dadosConsumoCacheado.filter(item =>
        item.setor.toLowerCase().includes(filtro.toLowerCase())
    );
    preencherTabela(filtered);
}

/**
 * Função: Gerar Relatórios e Análises
 * @param {Array} dados - Array de registros
 */
function gerarRelatorios(dados) {
    gerarGraficoDistribuicao(dados);
    gerarComparativoSetores(dados);
}

/**
 * Função: Gerar Gráfico de Distribuição de Consumo
 * Usa Chart.js para criar gráfico de barras
 * @param {Array} dados - Array de registros
 */
function gerarGraficoDistribuicao(dados) {
    const canvas = document.getElementById('chartConsumo');
    if (!canvas) return;

    // Agrupar dados por setor
    const setores = {};
    dados.forEach(item => {
        if (!setores[item.setor]) {
            setores[item.setor] = [];
        }
        setores[item.setor].push(item.consumo);
    });

    // Preparar dados para o gráfico
    const labels = Object.keys(setores);
    const valoresTotais = labels.map(setor => {
        return setores[setor].reduce((total, consumo) => total + consumo, 0);
    });

    const valoresMedios = labels.map(setor => {
        return calcularMedia(setores[setor]);
    });

    // Cores eco-friendly para os setores
    const cores = {
        'Iluminação': 'rgba(46, 204, 113, 0.8)',
        'HVAC': 'rgba(52, 152, 219, 0.8)',
        'Computadores': 'rgba(155, 89, 182, 0.8)',
        'Cozinha': 'rgba(230, 126, 34, 0.8)',
        'Limpeza': 'rgba(149, 165, 166, 0.8)'
    };

    const coresBorda = {
        'Iluminação': 'rgba(46, 204, 113, 1)',
        'HVAC': 'rgba(52, 152, 219, 1)',
        'Computadores': 'rgba(155, 89, 182, 1)',
        'Cozinha': 'rgba(230, 126, 34, 1)',
        'Limpeza': 'rgba(149, 165, 166, 1)'
    };

    const backgroundColors = labels.map(setor => cores[setor] || 'rgba(149, 165, 166, 0.8)');
    const borderColors = labels.map(setor => coresBorda[setor] || 'rgba(149, 165, 166, 1)');

    // Destruir gráfico anterior se existir
    if (window.graficoDistribuicao) {
        window.graficoDistribuicao.destroy();
    }

    // Criar novo gráfico
    const ctx = canvas.getContext('2d');
    window.graficoDistribuicao = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Consumo Total (kWh)',
                data: valoresTotais,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 2,
                borderRadius: 4,
                borderSkipped: false,
            }, {
                label: 'Consumo Médio (kWh)',
                data: valoresMedios,
                type: 'line',
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                borderColor: 'rgba(231, 76, 60, 1)',
                borderWidth: 3,
                pointBackgroundColor: 'rgba(231, 76, 60, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
                fill: false,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Distribuição de Consumo por Setor',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: {
                        top: 10,
                        bottom: 30
                    }
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderWidth: 1,
                    cornerRadius: 6,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += context.parsed.y.toFixed(2) + ' kWh';
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + ' kWh';
                        },
                        font: {
                            size: 11
                        }
                    },
                    title: {
                        display: true,
                        text: 'Consumo (kWh)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 12,
                            weight: '500'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Setores',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });

    console.log('📊 Gráfico de distribuição criado com sucesso');
}

/**
 * Função: Gerar Comparativo por Setor
 * @param {Array} dados - Array de registros
 */
function gerarComparativoSetores(dados) {
    const containerSetor = document.getElementById('setorComparativo');
    if (!containerSetor) return;
    
    // Agrupar por setor
    const setores = {};
    dados.forEach(item => {
        if (!setores[item.setor]) {
            setores[item.setor] = [];
        }
        setores[item.setor].push(item.consumo);
    });
    
    // Calcular consumo médio por setor
    containerSetor.innerHTML = '';
    
    for (let setor in setores) {
        const consumos = setores[setor];
        const media = calcularMedia(consumos);
        const total = consumos.reduce((a, b) => a + b, 0);
        
        const item = document.createElement('div');
        item.className = 'sector-item';
        item.innerHTML = `
            <span class="sector-name">${setor}</span>
            <div style="text-align: right;">
                <div class="sector-value">${media.toFixed(2)} kWh (média)</div>
                <div style="font-size: 0.85rem; color: #95a5a6;">${total.toFixed(2)} kWh (total)</div>
            </div>
        `;
        containerSetor.appendChild(item);
    }
}

/**
 * Função: Formatar data (DD/MM/YYYY)
 * @param {String} dataString - Data em formato YYYY-MM-DD
 * @returns {String} Data formatada
 */
function formatarData(dataString) {
    const data = new Date(dataString + 'T00:00:00');
    return data.toLocaleDateString('pt-BR');
}

/**
 * Função: Logout do sistema
 * Simula logout removendo dados da sessão
 */
function logout() {
    if (confirm('Tem certeza que deseja sair do sistema?')) {
        // Limpar dados em cache
        dadosConsumoCacheado = [];
        
        // Limpar interface
        document.getElementById('mediaConsumo').textContent = '0 kWh';
        document.getElementById('medianaConsumo').textContent = '0 kWh';
        document.getElementById('modaConsumo').textContent = '0 kWh';
        document.getElementById('totalConsumo').textContent = '0 kWh';
        document.getElementById('tableBody').innerHTML = '';
        
        // Destruir gráfico se existir
        if (window.graficoDistribuicao) {
            window.graficoDistribuicao.destroy();
            window.graficoDistribuicao = null;
        }
        
        // Limpar comparativo
        const containerSetor = document.getElementById('setorComparativo');
        if (containerSetor) {
            containerSetor.innerHTML = '<p style="text-align: center; color: #95a5a6; padding: 20px;">Faça login para visualizar os dados</p>';
        }
        
        // Simular redirecionamento para login
        mostrarNotificacao('Logout realizado com sucesso!', 'info');
        
        // Em produção, redirecionaria para página de login
        // window.location.href = '/login.html';
    }
}
