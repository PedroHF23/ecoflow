(function () {
    const answers = [
        { terms: ['reduzir', 'conta', 'economizar', 'economia'], answer: 'Comece pelos equipamentos em modo de espera, ajuste o ar-condicionado para uma temperatura confortável e prefira lâmpadas LED. Acompanhar o consumo mensal ajuda a perceber o efeito de cada mudança.' },
        { terms: ['solar', 'painel', 'fotovolta'], answer: 'Painéis fotovoltaicos convertem luz solar em eletricidade. A instalação depende de telhado adequado, dimensionamento do consumo e regras da distribuidora local; uma avaliação técnica estima o retorno para cada imóvel.' },
        { terms: ['compensa', 'crédito', 'distribuidora'], answer: 'Na geração distribuída, energia excedente pode virar créditos conforme as regras vigentes e a modalidade contratada. Consulte sua distribuidora e a regulamentação local para prazos, tarifas e elegibilidade.' },
        { terms: ['co2', 'carbono', 'emissão'], answer: 'Reduzir o consumo elétrico pode evitar emissões associadas à geração de energia. O resultado varia conforme a matriz elétrica e o período; o painel usa um fator de referência apenas para estimativa.' },
        { terms: ['limpa', 'renovável', 'sustentável'], answer: 'Fontes renováveis incluem solar, eólica, hídrica e biomassa. Verifique a origem da energia e as condições do fornecedor antes de contratar um plano.' }
    ];

    function appendMessage(text, className) {
        const message = document.createElement('div');
        message.className = `chat-bubble ${className}`;
        message.textContent = text;
        const messages = document.getElementById('chatMessages');
        messages.appendChild(message);
        messages.scrollTop = messages.scrollHeight;
    }

    function answerQuestion(question) {
        const normalized = question.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const match = answers.find((entry) => entry.terms.some((term) => normalized.includes(term)));
        return match ? match.answer : 'Posso ajudar com redução de consumo, energia solar, compensação de energia ou emissões de CO₂. Escolha um dos tópicos sugeridos ou pergunte de outro jeito.';
    }

    function submitQuestion(question) {
        const trimmed = question.trim();
        if (!trimmed) return;
        appendMessage(trimmed, 'user-message');
        appendMessage(answerQuestion(trimmed), 'bot-message');
    }

    function init() {
        const panel = document.getElementById('chatPanel');
        const launcher = document.getElementById('chatLauncher');
        function setOpen(open) {
            panel.hidden = !open;
            launcher.setAttribute('aria-expanded', String(open));
            if (open) document.getElementById('chatInput').focus();
        }
        launcher.addEventListener('click', () => setOpen(panel.hidden));
        document.getElementById('chatClose').addEventListener('click', () => setOpen(false));
        document.getElementById('faqQuestions').addEventListener('click', (event) => {
            const button = event.target.closest('button[data-question]');
            if (button) submitQuestion(button.dataset.question);
        });
        document.getElementById('chatForm').addEventListener('submit', (event) => {
            event.preventDefault();
            const input = document.getElementById('chatInput');
            submitQuestion(input.value);
            input.value = '';
        });
    }

    document.addEventListener('DOMContentLoaded', init);
})();