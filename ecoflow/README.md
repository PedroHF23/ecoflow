# 🌿 EcoFlow - Sistema Web de Monitoramento de Sustentabilidade

## Visão Geral

**EcoFlow** é uma aplicação web moderna para monitoramento integrado de sustentabilidade em organizações. O sistema permite rastrear consumo de energia, água e outros recursos, com análises estatísticas em tempo real e conformidade total com a Lei Geral de Proteção de Dados (LGPD).

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📋 Requisitos Técnicos

### Hardware Mínimo
- Processador: Intel i5 / AMD Ryzen 5 (ou equivalente)
- RAM: 4 GB
- Disco: 500 MB livre

### Software Necessário
- **Python 3.8+**
- **Node.js** (opcional, para ferramentas de build)
- **Git** (para versionamento)
- **SQLite3** (incluído no Python)

---

## 🚀 Instalação

### 1. Clonar Repositório

```bash
git clone https://github.com/seu-usuario/ecoflow.git
cd ecoflow
```

### 2. Configurar Backend Python

```bash
# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt
```

### 3. Configurar Frontend

O frontend é vanilla (sem dependências npm). Apenas servir a pasta `frontend/` com um servidor HTTP:

```bash
# Opção 1: Usar Python (recomendado)
cd frontend
python -m http.server 8000

# Opção 2: Usar Node.js
npm install -g http-server
http-server .

# Opção 3: Usar Live Server (VS Code)
# Instalar extensão "Live Server" no VS Code e clicar "Go Live"
```

### 4. Iniciar Backend

Em outro terminal (com `venv` ativado):

```bash
cd backend
python main.py
```

O backend estará disponível em `http://localhost:5000`

### 5. Acessar Aplicação

Abra seu navegador em:
```
http://localhost:8000
```

---

## 📁 Estrutura do Projeto

```
ecoflow/
│
├── frontend/                   # Camada de Apresentação
│   ├── index.html             # Estrutura semântica HTML5
│   ├── style.css              # Estilos responsivos (Mobile-First)
│   └── script.js              # Lógica interativa e consumo de API
│
├── backend/                    # Camada de Lógica de Negócio
│   ├── main.py                # Aplicação Flask + API RESTful
│   └── database.sql           # Esquema do banco de dados relacional
│
├── docs/                       # Documentação
│   └── RELATORIO_ACADEMICO.md # Relatório completo (ABNT)
│
├── requirements.txt           # Dependências Python
├── .gitignore                # Arquivos ignorados pelo Git
└── README.md                 # Este arquivo

```

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Endpoints Disponíveis

| Método | Endpoint | Descrição | Exemplo |
|--------|----------|-----------|---------|
| GET | `/status` | Status da API | `curl http://localhost:5000/api/status` |
| GET | `/consumo` | Lista consumo últimos 30 dias | `curl http://localhost:5000/api/consumo` |
| GET | `/consumo?setor=Iluminação` | Consumo filtrado por setor | `curl http://localhost:5000/api/consumo?setor=Iluminação` |
| POST | `/consumo` | Criar novo registro | `curl -X POST -H "Content-Type: application/json" -d '{"setor":"Iluminação","consumo":120.5}' http://localhost:5000/api/consumo` |
| GET | `/estatisticas` | Cálculos estatísticos (Média, Mediana, Moda) | `curl http://localhost:5000/api/estatisticas` |
| GET | `/relatorio/<setor>` | Relatório detalhado de um setor | `curl http://localhost:5000/api/relatorio/Iluminação` |

### Exemplo de Resposta (GET /api/consumo)

```json
[
  {
    "id": 1,
    "setor": "Iluminação",
    "data": "2026-05-01",
    "consumo": 120.5,
    "status": "normal"
  },
  {
    "id": 2,
    "setor": "HVAC",
    "data": "2026-05-01",
    "consumo": 350.8,
    "status": "normal"
  }
]
```

---

## 📊 Funcionalidades Principais

### Dashboard
- 📈 Métricas em tempo real (Média, Mediana, Moda)
- 🎯 Comparativo de consumo por setor
- 🔔 Alertas de anomalias
- 📅 Histórico de 30 dias

### Análise de Dados
- Cálculos estatísticos automáticos
- Filtragem por setor e período
- Relatórios por departamento
- Exportação de dados

### Conformidade
- ✅ Lei Geral de Proteção de Dados (LGPD)
- 📋 Auditoria de acessos
- 🔐 Controle de permissões
- 📝 Logs detalhados

---

## 🎨 Design e Usabilidade

### Paleta de Cores (Eco-Friendly)
- **Verde Primário:** #2ecc71 (sustentabilidade)
- **Azul Primário:** #3498db (tecnologia/confiança)
- **Cinza Neutro:** #f8f9fa (backgrounds)

### Responsividade
- ✅ Desktop (1200px+)
- ✅ Tablet (768px - 1199px)
- ✅ Mobile (< 768px)

### Acessibilidade
- Contrates WCAG AA+
- Labels descritivas
- Navegação por teclado
- ARIA attributes

---

## 📈 Tecnologias Utilizadas

### Frontend
```
├── HTML5            # Estrutura semântica
├── CSS3             # Design responsivo
│   ├── Grid         # Layouts complexos
│   ├── Flexbox      # Alinhamento
│   └── Media Queries # Responsividade
└── JavaScript       # Interatividade
    ├── Fetch API    # Requisições HTTP
    ├── DOM APIs     # Manipulação DOM
    └── Cálculos     # Estatísticas
```

### Backend
```
├── Python 3.8+      # Linguagem
├── Flask            # Framework web
├── Flask-CORS       # CORS support
└── SQLite3          # Banco de dados
```

---

## 📚 Documentação

Para documentação completa do projeto, incluindo:
- Análise estatística detalhada
- Conformidade LGPD
- Objetivos de Desenvolvimento Sustentável (ODS)
- Cronograma de sprints
- Referências bibliográficas ABNT

Veja: [docs/RELATORIO_ACADEMICO.md](docs/RELATORIO_ACADEMICO.md)

---

## 🧪 Testes

### Testar Backend

```bash
# Verificar status da API
curl http://localhost:5000/api/status

# Listar consumo
curl http://localhost:5000/api/consumo | json_pp

# Criar novo consumo
curl -X POST http://localhost:5000/api/consumo \
  -H "Content-Type: application/json" \
  -d '{"setor":"Iluminação","consumo":125.0,"data":"2026-05-15"}'

# Obter estatísticas
curl http://localhost:5000/api/estatisticas | json_pp
```

### Testar Frontend

1. Abrir em navegador: `http://localhost:8000`
2. Abrir DevTools (F12)
3. Verificar Console para logs
4. Testar responsividade (F12 > Responsive Design Mode)

---

## 🔒 Segurança

### Implementações de Segurança

- ✅ **CORS**: Limitado a origem conhecida
- ✅ **Validação de Input**: Server-side
- ✅ **SQL Injection**: Prepared statements
- ✅ **XSS Protection**: Sanitização de HTML
- ✅ **HTTPS**: Configurável em produção
- ✅ **Logs de Auditoria**: Todas as operações registradas

### Compliance LGPD

- ✅ Consentimento explícito para coleta
- ✅ Transparência de uso de dados
- ✅ Direito ao acesso e esquecimento
- ✅ Notificação de incidentes
- ✅ Retenção limitada (30 dias)

---

## 🚢 Deployment

### Opção 1: Servidor Local

```bash
# Terminal 1: Backend
cd backend
python main.py

# Terminal 2: Frontend
cd frontend
python -m http.server 8000
```

### Opção 2: Docker

```bash
# Construir imagem
docker build -t ecoflow .

# Executar container
docker run -p 5000:5000 -p 8000:8000 ecoflow
```

### Opção 3: Cloud (Heroku, AWS, Google Cloud)

```bash
# Exemplo: Heroku
heroku create ecoflow
git push heroku main
```

---

## 🤝 Contribuindo

### Processo de Contribuição

1. Fork o repositório
2. Criar branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push para branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

### Padrões de Código

- Python: PEP 8
- JavaScript: StandardJS
- CSS: BEM (Block Element Modifier)

---

## 📈 Roadmap Futuro

### V2.0 (Próximas Sprints)
- [ ] Integração com IoT (sensores reais)
- [ ] Machine Learning para previsão de consumo
- [ ] Gamification (competição entre setores)
- [ ] Mobile app (React Native / Flutter)

### V3.0
- [ ] IA Generativa para relatórios automáticos
- [ ] Integração com ERPs
- [ ] Blockchain para auditoria imutável
- [ ] WebRTC para comunicação em tempo real

---

## ❓ FAQ

**P: Como resetar o banco de dados?**
R: Delete `backend/ecoflow_database.db` e reinicie o servidor.

**P: Qual navegador usar?**
R: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

**P: Como obter dados reais?**
R: Integrar com sensores IoT via MQTT ou API de utility providers.

**P: Preciso de Node.js?**
R: Não. O frontend é vanilla (sem dependências npm).

---

## 📞 Suporte

- 📧 **Email:** support@ecoflow.local
- 🐛 **Issues:** [GitHub Issues](https://github.com/seu-usuario/ecoflow/issues)
- 💬 **Discussões:** [GitHub Discussions](https://github.com/seu-usuario/ecoflow/discussions)

---

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja [LICENSE](LICENSE) para detalhes.

---

## ✨ Agradecimentos

- Equipe de Desenvolvimento
- Mentores e professores
- Comunidade de código aberto

---

**Versão:** 1.0.0  
**Data de Atualização:** Maio de 2026  
**Status:** ✅ Produção

🌿 **Contribuindo para um futuro mais sustentável, um monitoramento de cada vez.**

