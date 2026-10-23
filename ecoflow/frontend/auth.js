(function () {
    const CPF_LENGTH = 11;
    const CNPJ_LENGTH = 14;
    const USERS_KEY = 'ecoflow.users';
    const PASSWORD_ITERATIONS = 120000;
    let accountType = 'empresa';
    let authMode = 'login';

    function onlyDigits(value) {
        return value.replace(/\D/g, '');
    }

    function formatDocument(value, type) {
        const digits = onlyDigits(value).slice(0, type === 'empresa' ? CNPJ_LENGTH : CPF_LENGTH);
        if (type === 'casa') {
            return digits.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1-$2');
        }
        return digits.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2');
    }

    function hasRepeatedDigits(value) {
        return /^\d+$/.test(value) && /^(.)(\1)+$/.test(value);
    }

    function validateCpf(value) {
        const digits = onlyDigits(value);
        if (digits.length !== CPF_LENGTH || hasRepeatedDigits(digits)) return false;
        const checkDigit = (base, factor) => {
            const sum = [...base].reduce((total, digit, index) => total + Number(digit) * (factor - index), 0);
            const result = (sum * 10) % 11;
            return result === 10 ? 0 : result;
        };
        return checkDigit(digits.slice(0, 9), 10) === Number(digits[9]) && checkDigit(digits.slice(0, 10), 11) === Number(digits[10]);
    }

    function validateCnpj(value) {
        const digits = onlyDigits(value);
        if (digits.length !== CNPJ_LENGTH || hasRepeatedDigits(digits)) return false;
        const calculate = (base, weights) => {
            const remainder = [...base].reduce((sum, digit, index) => sum + Number(digit) * weights[index], 0) % 11;
            return remainder < 2 ? 0 : 11 - remainder;
        };
        const first = calculate(digits.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
        const second = calculate(digits.slice(0, 12) + first, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
        return first === Number(digits[12]) && second === Number(digits[13]);
    }

    function setFieldError(id, message) {
        const field = document.getElementById(id);
        const error = document.getElementById(`${id.replace('Input', '')}Error`);
        field.setAttribute('aria-invalid', message ? 'true' : 'false');
        if (error) error.textContent = message;
    }

    function setAuthenticated(isAuthenticated, name) {
        const loginScreen = document.getElementById('loginScreen');
        const appShell = document.getElementById('appShell');
        loginScreen.hidden = isAuthenticated;
        appShell.setAttribute('aria-hidden', String(!isAuthenticated));
        document.body.classList.toggle('is-authenticated', isAuthenticated);
        if (isAuthenticated && name) document.getElementById('accountName').textContent = name;
    }

    function readUsers() {
        try {
            const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
            return Array.isArray(users) ? users : [];
        } catch (error) {
            console.error('Não foi possível ler as contas locais.', error);
            return [];
        }
    }

    async function hashPassword(password, salt) {
        if (!window.crypto || !window.crypto.subtle) {
            throw new Error('A criptografia segura não está disponível. Abra a aplicação em HTTPS ou localhost.');
        }
        const encoder = new TextEncoder();
        const keyMaterial = await window.crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
        const derivedBits = await window.crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: PASSWORD_ITERATIONS, hash: 'SHA-256' }, keyMaterial, 256);
        return Array.from(new Uint8Array(derivedBits), (byte) => byte.toString(16).padStart(2, '0')).join('');
    }

    function setMode(mode) {
        authMode = mode;
        const isSignup = mode === 'signup';
        document.getElementById('loginTitle').textContent = isSignup ? 'Crie sua conta' : 'Acesse sua conta';
        document.querySelector('.login-subtitle').textContent = isSignup
            ? 'Cadastre seus dados para acompanhar sua energia.'
            : 'Entre para visualizar seu panorama de energia.';
        document.getElementById('authNote').textContent = isSignup
            ? 'Conta demonstrativa salva neste navegador. A senha será armazenada como hash.'
            : 'Acesso demonstrativo. As credenciais são verificadas neste navegador.';
        document.querySelector('.login-submit').innerHTML = isSignup
            ? 'Criar conta <span aria-hidden="true">→</span>'
            : 'Entrar <span aria-hidden="true">→</span>';
        document.getElementById('authSwitchPrompt').textContent = isSignup ? 'Já tem uma conta?' : 'Ainda não tem uma conta?';
        document.getElementById('authModeToggle').textContent = isSignup ? 'Já tenho uma conta' : 'Criar conta';
        document.getElementById('passwordInput').autocomplete = isSignup ? 'new-password' : 'current-password';
        setFieldError('documentInput', '');
        setFieldError('passwordInput', '');
    }

    function init() {
        const loginForm = document.getElementById('loginForm');
        const documentInput = document.getElementById('documentInput');
        const passwordInput = document.getElementById('passwordInput');
        const tabs = document.querySelectorAll('.login-tab');

        document.getElementById('authModeToggle').addEventListener('click', () => {
            setMode(authMode === 'login' ? 'signup' : 'login');
        });

        try {
            const session = JSON.parse(sessionStorage.getItem('ecoflow.session') || 'null');
            if (session && session.type && session.authenticated) {
                accountType = session.type;
                setAuthenticated(true, session.type === 'empresa' ? 'Conta empresa' : 'Minha casa');
            }
        } catch (error) {
            sessionStorage.removeItem('ecoflow.session');
        }

        tabs.forEach((tab) => tab.addEventListener('click', () => {
            accountType = tab.dataset.account;
            tabs.forEach((item) => {
                const active = item === tab;
                item.classList.toggle('is-active', active);
                item.setAttribute('aria-selected', String(active));
            });
            const isCompany = accountType === 'empresa';
            document.getElementById('documentLabel').textContent = isCompany ? 'CNPJ' : 'CPF';
            documentInput.placeholder = isCompany ? '00.000.000/0000-00' : '000.000.000-00';
            documentInput.maxLength = isCompany ? 18 : 14;
            documentInput.value = formatDocument(documentInput.value, accountType);
            setFieldError('documentInput', '');
        }));

        documentInput.addEventListener('input', () => {
            const position = documentInput.selectionStart;
            documentInput.value = formatDocument(documentInput.value, accountType);
            documentInput.setSelectionRange(position, position);
            setFieldError('documentInput', '');
        });
        passwordInput.addEventListener('input', () => setFieldError('passwordInput', ''));

        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const documentValue = onlyDigits(documentInput.value);
            const validDocument = accountType === 'empresa' ? validateCnpj(documentValue) : validateCpf(documentValue);
            const validPassword = passwordInput.value.length >= 6;
            setFieldError('documentInput', validDocument ? '' : `Informe um ${accountType === 'empresa' ? 'CNPJ' : 'CPF'} válido.`);
            setFieldError('passwordInput', validPassword ? '' : 'A senha deve ter pelo menos 6 caracteres.');
            if (!validDocument || !validPassword) return;

            try {
                const users = readUsers();
                const existingUserIndex = users.findIndex((user) => user.type === accountType && user.document === documentValue);

                if (authMode === 'signup') {
                    if (existingUserIndex !== -1) {
                        setFieldError('documentInput', 'Já existe uma conta cadastrada com este documento.');
                        return;
                    }
                    const salt = window.crypto.getRandomValues(new Uint8Array(16));
                    const passwordHash = await hashPassword(passwordInput.value, salt);
                    users.push({
                        type: accountType,
                        document: documentValue,
                        salt: Array.from(salt, (byte) => byte.toString(16).padStart(2, '0')).join(''),
                        passwordHash
                    });
                    localStorage.setItem(USERS_KEY, JSON.stringify(users));
                    setMode('login');
                    passwordInput.value = '';
                    if (window.mostrarNotificacao) window.mostrarNotificacao('Conta criada. Entre com seu documento e senha.', 'success');
                    return;
                }

                if (existingUserIndex === -1) {
                    setFieldError('documentInput', 'Nenhuma conta encontrada. Crie uma conta para continuar.');
                    return;
                }

                const existingUser = users[existingUserIndex];
                const salt = Uint8Array.from(existingUser.salt.match(/.{2}/g), (byte) => parseInt(byte, 16));
                const passwordHash = await hashPassword(passwordInput.value, salt);
                if (passwordHash !== existingUser.passwordHash) {
                    setFieldError('passwordInput', 'Senha incorreta. Confira e tente novamente.');
                    return;
                }

                sessionStorage.setItem('ecoflow.session', JSON.stringify({ type: accountType, authenticated: true }));
                setAuthenticated(true, accountType === 'empresa' ? 'Conta empresa' : 'Minha casa');
                if (window.mostrarNotificacao) window.mostrarNotificacao('Acesso realizado com sucesso.', 'success');
            } catch (error) {
                console.error('Falha no fluxo de autenticação local.', error);
                window.mostrarNotificacao('Não foi possível iniciar a sessão neste navegador.', 'error');
            }
        });
    }

    window.EcoFlowAuth = {
        logout() {
            try {
                sessionStorage.removeItem('ecoflow.session');
            } catch (error) {
                console.error('Não foi possível limpar a sessão.', error);
            }
            setAuthenticated(false);
            document.getElementById('passwordInput').value = '';
            window.mostrarNotificacao('Sessão encerrada.', 'info');
        },
        validateCpf,
        validateCnpj
    };

    document.addEventListener('DOMContentLoaded', init);
})();