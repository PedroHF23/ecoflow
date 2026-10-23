// ============================================
// ECOFLOW - Script de Interatividade
// Consumo de API, Cálculos Estatísticos, DOM
// ============================================

// Configuração de API
const API_BASE_URL = 'http://localhost:5000/api';

function mostrarNotificacao(mensagem, tipo = 'info') {
    const region = document.getElementById('toastRegion');
    if (!region) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.dataset.type = ['success', 'error', 'info'].includes(tipo) ? tipo : 'info';
    toast.textContent = mensagem;
    region.appendChild(toast);
    window.setTimeout(() => toast.remove(), 5000);
}

// Dados em cache
let dadosConsumoCacheado = [];
let dadosRelatorioCacheados = [];
let participacoesSetor = {};
let contaPreferenciaSetor = null;
let setoresPreferencia = [];

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

    window.addEventListener('ecoflow:account-changed', () => {
        carregarPreferenciasSetor(dadosRelatorioCacheados);
        renderizarConfiguracaoSetor();
        atualizarRelatoriosPersonalizados();
    });
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
        
        // A visão geral é calculada a partir das faturas da conta ativa.
        preencherTabela(dados);
        gerarRelatorios(dados);
        
    } catch (erro) {
        console.error('✗ Erro ao carregar dados:', erro);
        // Usar dados demonstrativos se API falhar
        usarDadosDemonstrativos();
        mostrarNotificacao('API indisponível. A dashboard está usando dados demonstrativos.', 'info');
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
    dadosRelatorioCacheados = Array.isArray(dados) ? dados : [];
    const accountId = obterContaAtivaId();
    const setoresAtuais = obterSetores(dadosRelatorioCacheados);
    const mesmoContexto = contaPreferenciaSetor === accountId
        && setoresAtuais.length === setoresPreferencia.length
        && setoresAtuais.every((setor, index) => setor === setoresPreferencia[index]);

    if (!mesmoContexto) carregarPreferenciasSetor(dadosRelatorioCacheados);
    renderizarConfiguracaoSetor();
    gerarGraficoDistribuicao(dados);
    gerarComparativoSetores(dados);
}

function obterContaAtivaId() {
    try {
        const session = JSON.parse(sessionStorage.getItem('ecoflow.session') || 'null');
        if (!session || !session.authenticated || !session.type || !/^\d+$/.test(session.document || '')) return null;
        return `${session.type}:${session.document}`;
    } catch (error) {
        console.error('Não foi possível identificar a conta para as preferências de relatório.', error);
        return null;
    }
}

function obterSetores(dados) {
    return [...new Set(dados.map((item) => item.setor).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

function obterPreferenciasKey(accountId) {
    return `ecoflow.sector-splits.${encodeURIComponent(accountId)}`;
}

function criarDivisaoPadrao(dados, setores) {
    if (!setores.length) return {};
    const totais = Object.fromEntries(setores.map((setor) => [setor, 0]));
    dados.forEach((item) => {
        if (Object.hasOwn(totais, item.setor) && Number.isFinite(Number(item.consumo))) {
            totais[item.setor] += Number(item.consumo);
        }
    });
    const total = Object.values(totais).reduce((sum, value) => sum + value, 0);
    const quotas = setores.map((setor) => total > 0 ? totais[setor] / total * 100 : 100 / setores.length);
    const shares = quotas.map(Math.floor);
    let remaining = 100 - shares.reduce((sum, value) => sum + value, 0);
    const order = quotas.map((quota, index) => ({ index, remainder: quota - shares[index] }))
        .sort((a, b) => b.remainder - a.remainder);
    for (let index = 0; index < remaining; index += 1) shares[order[index].index] += 1;
    return Object.fromEntries(setores.map((setor, index) => [setor, shares[index]]));
}

function carregarPreferenciasSetor(dados) {
    const accountId = obterContaAtivaId();
    setoresPreferencia = obterSetores(dados);
    contaPreferenciaSetor = accountId;
    const defaults = criarDivisaoPadrao(dados, setoresPreferencia);
    participacoesSetor = defaults;

    if (!accountId) return;
    try {
        const stored = JSON.parse(localStorage.getItem(obterPreferenciasKey(accountId)) || 'null');
        if (!stored || setoresPreferencia.some((setor) => !Number.isInteger(stored[setor]) || stored[setor] < 0 || stored[setor] > 100)) return;
        const sum = setoresPreferencia.reduce((total, setor) => total + stored[setor], 0);
        if (sum === 100) participacoesSetor = Object.fromEntries(setoresPreferencia.map((setor) => [setor, stored[setor]]));
    } catch (error) {
        console.error('Não foi possível carregar a divisão personalizada.', error);
    }
}

function renderizarConfiguracaoSetor() {
    const controls = document.getElementById('sectorControls');
    if (!controls) return;
    controls.replaceChildren();

    setoresPreferencia.forEach((setor, index) => {
        const group = document.createElement('label');
        group.className = 'sector-control';
        group.htmlFor = `sectorShare${index}`;
        const name = document.createElement('span');
        name.className = 'sector-control-name';
        name.textContent = setor;
        const input = document.createElement('input');
        input.className = 'sector-share-input';
        input.id = `sectorShare${index}`;
        input.type = 'number';
        input.min = '0';
        input.max = '100';
        input.step = '1';
        input.inputMode = 'numeric';
        input.value = String(participacoesSetor[setor] ?? 0);
        input.dataset.sectorIndex = String(index);
        input.setAttribute('aria-label', `Participação percentual de ${setor}`);
        const unit = document.createElement('span');
        unit.className = 'sector-control-unit';
        unit.textContent = '%';
        group.append(name, input, unit);
        controls.appendChild(group);
        input.addEventListener('input', atualizarParticipacoesSetor);
    });

    atualizarSomaParticipacoes();
}

function atualizarSomaParticipacoes() {
    const inputs = [...document.querySelectorAll('.sector-share-input')];
    const total = inputs
        .reduce((sum, input) => sum + (input.value === '' ? 0 : Number(input.value)), 0);
    const totalElement = document.getElementById('sectorPercentageTotal');
    const status = document.getElementById('sectorSettingsStatus');
    const validInputs = inputs.length > 0 && inputs.every((input) => input.value !== ''
        && Number.isInteger(Number(input.value))
        && Number(input.value) >= 0
        && Number(input.value) <= 100);
    const valid = validInputs && total === 100;
    totalElement.innerHTML = `Total <strong>${Number.isInteger(total) ? total : total.toFixed(1)}%</strong>`;
    totalElement.classList.toggle('is-valid', valid);
    totalElement.classList.toggle('is-invalid', !valid);
    status.textContent = valid
        ? 'Divisão aplicada e salva nesta conta.'
        : `A soma atual é ${Number.isInteger(total) ? total : total.toFixed(1)}%. Preencha percentuais inteiros e ajuste até completar 100%.`;
    status.classList.toggle('is-valid', valid);
    status.classList.toggle('is-invalid', !valid);
    return valid;
}

function atualizarParticipacoesSetor() {
    const inputs = [...document.querySelectorAll('.sector-share-input')];
    inputs.forEach((input) => {
        const value = Number(input.value);
        input.setAttribute('aria-invalid', String(input.value !== '' && (!Number.isInteger(value) || value < 0 || value > 100)));
    });
    if (!atualizarSomaParticipacoes()) return;

    participacoesSetor = Object.fromEntries(inputs.map((input) => [
        setoresPreferencia[Number(input.dataset.sectorIndex)], Number(input.value)
    ]));
    const accountId = obterContaAtivaId();
    if (accountId) {
        try {
            localStorage.setItem(obterPreferenciasKey(accountId), JSON.stringify(participacoesSetor));
        } catch (error) {
            document.getElementById('sectorSettingsStatus').textContent = 'Divisão aplicada, mas não foi possível salvá-la neste navegador.';
            console.error('Não foi possível salvar a divisão personalizada.', error);
        }
    }
    atualizarRelatoriosPersonalizados();
}

function obterConsumoPersonalizado(dados) {
    const totaisOriginais = Object.fromEntries(setoresPreferencia.map((setor) => [setor, 0]));
    const contagens = Object.fromEntries(setoresPreferencia.map((setor) => [setor, 0]));
    dados.forEach((item) => {
        if (Object.hasOwn(totaisOriginais, item.setor) && Number.isFinite(Number(item.consumo))) {
            totaisOriginais[item.setor] += Number(item.consumo);
            contagens[item.setor] += 1;
        }
    });
    const consumoTotal = Object.values(totaisOriginais).reduce((sum, value) => sum + value, 0);
    return setoresPreferencia.map((setor) => {
        const total = consumoTotal * (Number(participacoesSetor[setor] || 0) / 100);
        return { setor, total, media: contagens[setor] ? total / contagens[setor] : 0, percentual: Number(participacoesSetor[setor] || 0) };
    });
}

function atualizarRelatoriosPersonalizados() {
    if (!dadosRelatorioCacheados.length) {
        gerarGraficoDistribuicao([]);
        gerarComparativoSetores([]);
        return;
    }
    gerarGraficoDistribuicao(dadosRelatorioCacheados);
    gerarComparativoSetores(dadosRelatorioCacheados);
}

/**
 * Função: Gerar Gráfico de Distribuição de Consumo
 * Usa Chart.js para criar gráfico de barras
 * @param {Array} dados - Array de registros
 */
function gerarGraficoDistribuicao(dados) {
    const canvas = document.getElementById('chartConsumo');
    if (!canvas || typeof Chart === 'undefined') return;

    // Agrupar dados por setor
    const setores = {};
    dados.forEach(item => {
        if (!setores[item.setor]) {
            setores[item.setor] = [];
        }
        setores[item.setor].push(item.consumo);
    });

    if (setoresPreferencia.length === 0) {
        setoresPreferencia = Object.keys(setores).sort((a, b) => a.localeCompare(b, 'pt-BR'));
        participacoesSetor = criarDivisaoPadrao(dados, setoresPreferencia);
        contaPreferenciaSetor = obterContaAtivaId();
    }

    const distribuicao = obterConsumoPersonalizado(dados);
    const labels = distribuicao.map((item) => item.setor);
    const valoresTotais = distribuicao.map((item) => item.total);
    const valoresMedios = distribuicao.map((item) => item.media);

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
    
    containerSetor.innerHTML = '';
    const distribuicao = obterConsumoPersonalizado(dados);

    for (const itemDistribuicao of distribuicao) {
        const { setor, media, total, percentual } = itemDistribuicao;
        const item = document.createElement('div');
        item.className = 'sector-item';
        item.innerHTML = `
            <span class="sector-name">${setor} <small>${percentual}%</small></span>
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
    if (window.EcoFlowAuth) window.EcoFlowAuth.logout();
}
