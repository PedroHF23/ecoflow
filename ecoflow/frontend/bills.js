(function () {
    const STORAGE_KEY = 'ecoflow.bills';
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    const CO2_KG_PER_KWH = 0.084;
    let selectedFile = null;
    let ocrTimer = null;

    function readBills() {
        try {
            const bills = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            return Array.isArray(bills) ? bills.filter((bill) => Number.isFinite(bill.consumption) && Number.isFinite(bill.amount)) : [];
        } catch (error) {
            console.error('Não foi possível ler as faturas salvas.', error);
            return [];
        }
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }

    function formatMonth(value) {
        const [year, month] = value.split('-').map(Number);
        return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(year, month - 1, 1));
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
    }

    function renderBills() {
        const bills = readBills().sort((a, b) => b.month.localeCompare(a.month));
        const list = document.getElementById('billList');
        document.getElementById('billCount').textContent = String(bills.length);
        if (!bills.length) {
            list.innerHTML = '<p class="empty-state">Suas faturas salvas aparecerão aqui.</p>';
            updateSavings(null);
            return;
        }
        list.innerHTML = bills.slice(0, 5).map((bill) => `
            <article class="bill-item">
                <div><strong>${escapeHtml(formatMonth(bill.month))}</strong><span>${bill.consumption.toLocaleString('pt-BR')} kWh${bill.fileName ? ` · ${escapeHtml(bill.fileName)}` : ''}</span></div>
                <strong>${formatCurrency(bill.amount)}</strong>
            </article>`).join('');
        updateSavings(bills[0]);
    }

    function updateSavings(bill) {
        const target = Number(document.getElementById('reductionTarget').value);
        document.getElementById('reductionValue').textContent = `${target}%`;
        const kwh = document.getElementById('savedKwh');
        const money = document.getElementById('savedMoney');
        const co2 = document.getElementById('savedCo2');
        const footnote = document.getElementById('savingsFootnote');
        if (!bill) {
            kwh.textContent = '-- kWh';
            money.textContent = '--';
            co2.textContent = '-- kg';
            footnote.textContent = 'Cadastre uma fatura para estimar sua economia.';
            return;
        }
        const savedKwh = bill.consumption * target / 100;
        const savedMoney = bill.amount * target / 100;
        const savedCo2 = savedKwh * CO2_KG_PER_KWH;
        kwh.textContent = `${savedKwh.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kWh`;
        money.textContent = formatCurrency(savedMoney);
        co2.textContent = `${savedCo2.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg`;
        footnote.textContent = `Estimativa sobre ${formatMonth(bill.month)} · fator de referência: ${CO2_KG_PER_KWH} kg CO₂/kWh.`;
    }

    function updateFileStatus(message, isError) {
        const status = document.getElementById('fileStatus');
        status.textContent = message;
        status.classList.toggle('is-error', Boolean(isError));
    }

    function simulateOcr(file) {
        const status = document.getElementById('ocrStatus');
        status.textContent = 'Analisando fatura...';
        status.classList.remove('is-error');
        window.clearTimeout(ocrTimer);
        ocrTimer = window.setTimeout(() => {
            const consumptionInput = document.getElementById('billConsumption');
            const amountInput = document.getElementById('billAmount');
            const seed = [...file.name].reduce((sum, character) => sum + character.charCodeAt(0), 0);
            if (!consumptionInput.value) consumptionInput.value = (180 + (seed % 240) + ((seed % 10) / 10)).toFixed(1);
            if (!amountInput.value) amountInput.value = (consumptionInput.valueAsNumber * (0.72 + (seed % 45) / 100)).toFixed(2);
            if (!document.getElementById('billMonth').value) document.getElementById('billMonth').value = new Date().toISOString().slice(0, 7);
            status.textContent = 'Leitura simulada concluída. Revise os valores antes de salvar.';
        }, 850);
    }

    async function syncConsumption(bill) {
        try {
            const response = await fetch(`${window.API_BASE_URL || 'http://localhost:5000/api'}/consumo`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ setor: 'Conta de luz', consumo: bill.consumption, data: `${bill.month}-01` })
            });
            if (!response.ok) throw new Error(`API respondeu com status ${response.status}.`);
            return true;
        } catch (error) {
            console.warn('Fatura salva localmente; sincronização de consumo indisponível.', error);
            return false;
        }
    }

    function init() {
        const form = document.getElementById('billForm');
        const fileInput = document.getElementById('billFile');
        const monthInput = document.getElementById('billMonth');
        monthInput.max = new Date().toISOString().slice(0, 7);
        document.getElementById('reductionTarget').addEventListener('input', renderBills);

        fileInput.addEventListener('change', () => {
            const file = fileInput.files && fileInput.files[0];
            selectedFile = null;
            document.getElementById('ocrStatus').textContent = '';
            if (!file) {
                updateFileStatus('Nenhum arquivo selecionado', false);
                return;
            }
            const validType = ['application/pdf', 'image/png', 'image/jpeg'].includes(file.type);
            if (!validType || file.size > MAX_FILE_SIZE) {
                fileInput.value = '';
                updateFileStatus(!validType ? 'Formato não suportado. Envie PDF, PNG ou JPG.' : 'O arquivo excede o limite de 10 MB.', true);
                return;
            }
            selectedFile = file;
            updateFileStatus(`${file.name} · ${(file.size / 1024 / 1024).toFixed(2)} MB`, false);
            simulateOcr(file);
        });

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!form.reportValidity()) return;
            const month = monthInput.value;
            const consumption = Number(document.getElementById('billConsumption').value);
            const amount = Number(document.getElementById('billAmount').value);
            if (!/^\d{4}-\d{2}$/.test(month) || !Number.isFinite(consumption) || consumption <= 0 || !Number.isFinite(amount) || amount <= 0) {
                window.mostrarNotificacao('Confira o mês, o consumo e o valor da fatura.', 'error');
                return;
            }
            const bills = readBills();
            if (bills.some((bill) => bill.month === month)) {
                window.mostrarNotificacao('Já existe uma fatura cadastrada para este mês.', 'error');
                return;
            }
            const bill = { id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`, month, consumption, amount, fileName: selectedFile ? selectedFile.name : '', createdAt: new Date().toISOString() };
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify([...bills, bill]));
            } catch (error) {
                window.mostrarNotificacao('Não foi possível salvar. Verifique o espaço disponível no navegador.', 'error');
                return;
            }
            renderBills();
            const synced = await syncConsumption(bill);
            window.mostrarNotificacao(synced ? 'Fatura salva e consumo sincronizado.' : 'Fatura salva neste navegador. A API está indisponível; a sincronização ficou pendente.', synced ? 'success' : 'info');
            form.reset();
            selectedFile = null;
            document.getElementById('ocrStatus').textContent = '';
            updateFileStatus('Nenhum arquivo selecionado', false);
        });

        renderBills();
    }

    document.addEventListener('DOMContentLoaded', init);
})();