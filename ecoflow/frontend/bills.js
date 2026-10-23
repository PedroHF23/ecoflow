(function () {
    const STORAGE_KEY = 'ecoflow.bills';
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    const CO2_KG_PER_KWH = 0.084;
    let selectedFile = null;
    let ocrTimer = null;
    let latestBill = null;

    function getActiveAccountId() {
        try {
            const session = JSON.parse(sessionStorage.getItem('ecoflow.session') || 'null');
            if (!session || !session.authenticated || !session.type || !/^\d+$/.test(session.document || '')) return null;
            return `${session.type}:${session.document}`;
        } catch (error) {
            console.error('Não foi possível identificar a conta ativa.', error);
            return null;
        }
    }

    function getStorageKey(accountId) {
        return `${STORAGE_KEY}.${encodeURIComponent(accountId)}`;
    }

    function readBills() {
        const accountId = getActiveAccountId();
        if (!accountId) return [];

        try {
            const bills = JSON.parse(localStorage.getItem(getStorageKey(accountId)) || '[]');
            return Array.isArray(bills)
                ? bills.filter((bill) => bill.accountId === accountId && Number.isFinite(bill.consumption) && Number.isFinite(bill.amount))
                : [];
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
        updateConsumptionMetrics(bills);
        latestBill = bills[0] || null;
        if (!bills.length) {
            list.innerHTML = '<p class="empty-state">Suas faturas salvas aparecerão aqui.</p>';
            updateSavings(latestBill);
            return;
        }
        list.innerHTML = bills.slice(0, 5).map((bill) => `
            <article class="bill-item">
                <div><strong>${escapeHtml(formatMonth(bill.month))}</strong><span>${bill.consumption.toLocaleString('pt-BR')} kWh${bill.fileName ? ` · ${escapeHtml(bill.fileName)}` : ''}</span></div>
                <strong>${formatCurrency(bill.amount)}</strong>
            </article>`).join('');
        updateSavings(latestBill);
    }

    function updateConsumptionMetrics(bills) {
        const values = bills.map((bill) => bill.consumption).sort((a, b) => a - b);
        const total = values.reduce((sum, value) => sum + value, 0);
        const average = values.length ? total / values.length : 0;
        const middle = Math.floor(values.length / 2);
        const median = values.length
            ? values.length % 2 ? values[middle] : (values[middle - 1] + values[middle]) / 2
            : 0;
        const frequencies = new Map();
        values.forEach((value) => frequencies.set(value, (frequencies.get(value) || 0) + 1));
        const highestFrequency = Math.max(0, ...frequencies.values());
        const modes = highestFrequency > 1
            ? [...frequencies.entries()].filter(([, frequency]) => frequency === highestFrequency).map(([value]) => value)
            : [];
        const formatKwh = (value) => `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kWh`;

        document.getElementById('mediaConsumo').textContent = formatKwh(average);
        document.getElementById('medianaConsumo').textContent = formatKwh(median);
        document.getElementById('modaConsumo').textContent = modes.length
            ? modes.map((value) => formatKwh(value)).join(' · ')
            : 'Sem moda';
        document.getElementById('totalConsumo').textContent = formatKwh(total);
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
        co2.textContent = `${savedCo2.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} kg`;
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

    function init() {
        const form = document.getElementById('billForm');
        const fileInput = document.getElementById('billFile');
        const monthInput = document.getElementById('billMonth');
        monthInput.max = new Date().toISOString().slice(0, 7);
        document.getElementById('reductionTarget').addEventListener('input', () => updateSavings(latestBill));
        window.addEventListener('ecoflow:account-changed', renderBills);

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
            const accountId = getActiveAccountId();
            if (!accountId) {
                window.mostrarNotificacao('Entre na sua conta para cadastrar uma fatura.', 'error');
                return;
            }
            if (!/^\d{4}-\d{2}$/.test(month) || !Number.isFinite(consumption) || consumption <= 0 || !Number.isFinite(amount) || amount <= 0) {
                window.mostrarNotificacao('Confira o mês, o consumo e o valor da fatura.', 'error');
                return;
            }
            const bills = readBills();
            if (bills.some((bill) => bill.month === month)) {
                window.mostrarNotificacao('Já existe uma fatura cadastrada para este mês.', 'error');
                return;
            }
            const bill = { id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`, accountId, month, consumption, amount, fileName: selectedFile ? selectedFile.name : '', createdAt: new Date().toISOString() };
            try {
                localStorage.setItem(getStorageKey(accountId), JSON.stringify([...bills, bill]));
            } catch (error) {
                window.mostrarNotificacao('Não foi possível salvar. Verifique o espaço disponível no navegador.', 'error');
                return;
            }
            renderBills();
            window.mostrarNotificacao('Fatura salva nesta conta e neste navegador.', 'success');
            form.reset();
            selectedFile = null;
            document.getElementById('ocrStatus').textContent = '';
            updateFileStatus('Nenhum arquivo selecionado', false);
        });

        renderBills();
    }

    document.addEventListener('DOMContentLoaded', init);
})();