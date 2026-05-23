# 🏗️ Arquitetura do EcoFlow

## Diagrama de Camadas

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│                    NAVEGADOR DO USUÁRIO                         │
│                                                                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTP/HTTPS
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
        ▼                                       ▼
┌──────────────────────┐           ┌──────────────────────┐
│  CAMADA DE          │           │  CAMADA DE           │
│  APRESENTAÇÃO       │           │  LÓGICA DE NEGÓCIO   │
│                      │           │                      │
│  Frontend           │           │  Backend             │
│  ├── index.html    │───FETCH──▶│  ├── main.py        │
│  ├── style.css     │◀──JSON────│  ├── API RESTful    │
│  └── script.js     │           │  └── Cálculos       │
│                     │           │                      │
│  Responsável por:   │           │  Responsável por:   │
│  • Interface UI    │           │  • Processamento   │
│  • Interatividade  │           │  • Validações      │
│  • Consumo de API  │           │  • Estatísticas    │
│  • Renderização    │           │  • Lógica negócio  │
└──────────────────────┘           └──────────────────────┘
                                            │
                                            │ SQL
                                            │
                                    ┌───────▼──────────┐
                                    │  CAMADA DE       │
                                    │  PERSISTÊNCIA    │
                                    │                  │
                                    │  Database        │
                                    │  ├── SQLite     │
                                    │  ├── Tables     │
                                    │  ├── Indexes    │
                                    │  └── Views      │
                                    │                  │
                                    │  Responsável:   │
                                    │  • Armazenar   │
                                    │  • Integridade │
                                    │  • Queries     │
                                    └──────────────────┘
```

---

## Fluxo de Requisição

```
USUÁRIO                 FRONTEND              BACKEND              DATABASE
   │                       │                     │                     │
   │ 1. Abre página       │                     │                     │
   │──────────────────────▶│                     │                     │
   │                       │                     │                     │
   │                       │ 2. Requisita dados │                     │
   │                       │ (GET /api/consumo)│                     │
   │                       │────────────────────▶│                     │
   │                       │                     │                     │
   │                       │                     │ 3. Query SQL       │
   │                       │                     │────────────────────▶│
   │                       │                     │                     │
   │                       │                     │ 4. Retorna dados  │
   │                       │                     │◀────────────────────│
   │                       │                     │                     │
   │                       │ 5. Cria JSON       │                     │
   │                       │ com resposta       │                     │
   │                       │◀────────────────────│                     │
   │                       │                     │                     │
   │ 6. Renderiza   │                     │                     │
   │ Dashboard      │                     │                     │
   │◀──────────────────────│                     │                     │
   │                       │                     │                     │
   │ 7. Usuário vê        │                     │                     │
   │    resultados        │                     │                     │
   │                       │                     │                     │
```

---

## Estrutura de Banco de Dados

```
┌─────────────────────────────────────┐
│         Database SQLite             │
└─────────────────────────────────────┘
         │      │       │      │       │
         │      │       │      │       │
    ┌────▼──┬──▼──┬────▼─┬───▼──┬───▼──┐
    │        │     │      │      │      │
 CONSUMO  SETORES LOGS  ALERTAS USUARIOS RELATORIOS
    │        │     │      │      │      │
    │        │     │      │      │      │
 30 dias   5 setores    Auditoria  LGPD  Histórico
 histórico  padrão      compliance  dados  relatórios

┌──────────────────────────────────────┐
│  TABELA: consumo                     │
├──────────────────────────────────────┤
│ id          (INTEGER, PK)            │
│ setor       (TEXT, FK → setores)     │
│ data        (DATE)                   │
│ consumo     (REAL)                   │
│ status      (TEXT: normal/alerta)    │
│ criado_em   (TIMESTAMP)              │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  TABELA: setores                     │
├──────────────────────────────────────┤
│ id              (INTEGER, PK)        │
│ nome            (TEXT, UNIQUE)       │
│ descricao       (TEXT)               │
│ responsavel     (TEXT)               │
│ meta_consumo    (REAL)               │
│ criado_em       (TIMESTAMP)          │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  TABELA: logs                        │
├──────────────────────────────────────┤
│ id          (INTEGER, PK)            │
│ acao        (TEXT)                   │
│ detalhes    (TEXT)                   │
│ usuario     (TEXT)                   │
│ ip_address  (TEXT)                   │
│ timestamp   (TIMESTAMP)              │
└──────────────────────────────────────┘
```

---

## Fluxo de Cálculo Estatístico

```
┌──────────────────────────────────────────────┐
│  Requisição: GET /api/estatisticas          │
└──────────┬───────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────┐
│  Backend busca todos os consumos do BD       │
│  SELECT consumo FROM consumo ORDER BY consumo│
└──────────┬───────────────────────────────────┘
           │
           ▼
    ┌──────────────────────┐
    │  valores = [         │
    │    120.5, 125.0,    │
    │    118.3, 122.7,    │
    │    ...350.8, 345.2,│
    │    ...]             │
    └──────────┬──────────┘
               │
     ┌─────────┼─────────┐
     │         │         │
     ▼         ▼         ▼
   MÉDIA    MEDIANA    MODA
     │         │         │
     ▼         ▼         ▼
  120.5     122.05    121.4 kWh
  (média)  (central)  (frequente)
     │         │         │
     └─────────┼─────────┘
               │
               ▼
    ┌──────────────────────────────┐
    │  Retorna JSON com métricas   │
    │  {                           │
    │    "geral": {                │
    │      "media": 120.5,         │
    │      "mediana": 122.05,      │
    │      "moda": 121.4           │
    │    },                        │
    │    "por_setor": {...}        │
    │  }                           │
    └──────────────────────────────┘
```

---

## Componentes e Responsabilidades

### Frontend (Client-Side)

```javascript
// script.js - Funções principais

1. carregarDados()
   └─▶ Fetch API → GET /api/consumo
       └─▶ Atualizar dashboard
           └─▶ Renderizar tabela

2. calcularMedia(valores)
   └─▶ Σ(xi) / n
       └─▶ Exibir em card

3. calcularMediana(valores)
   └─▶ Valor central ordenado
       └─▶ Exibir em card

4. calcularModa(valores)
   └─▶ Valor mais frequente
       └─▶ Exibir em card

5. filtrarDadosTabela(filtro)
   └─▶ Filter array by setor
       └─▶ Re-render tabela

6. gerarRelatorios(dados)
   └─▶ Agrupar por setor
       └─▶ Calcular estatísticas
           └─▶ Renderizar comparativo
```

### Backend (Server-Side)

```python
# main.py - Endpoints da API

1. @app.route('/api/status')
   └─▶ Retorna: versão, timestamp

2. @app.route('/api/consumo', methods=['GET'])
   └─▶ Query: SELECT * FROM consumo
       └─▶ Retorna: Array de registros
           └─▶ Filtra: opcional (setor, dias)

3. @app.route('/api/consumo', methods=['POST'])
   └─▶ Valida: setor, consumo, data
       └─▶ Insere: INSERT INTO consumo
           └─▶ Registra: log de auditoria
               └─▶ Retorna: novo ID

4. @app.route('/api/estatisticas')
   └─▶ Calcula: média, mediana, moda
       └─▶ Agrupa: por setor
           └─▶ Retorna: objeto com métricas

5. @app.route('/api/relatorio/<setor>')
   └─▶ Busca: consumo do setor
       └─▶ Calcula: min, max, media, etc
           └─▶ Retorna: relatório completo
```

---

## Fluxo de CORS (Cross-Origin)

```
Frontend (localhost:8000)
        │
        │ Requisição HTTP
        │
        ▼
Backend (localhost:5000)
        │
        ├─ Verifica origem
        │  ├─ Se permitida: próximo
        │  └─ Se não: erro CORS
        │
        ├─ Processa requisição
        │
        └─ Retorna com headers:
           Access-Control-Allow-Origin: http://localhost:8000
           Access-Control-Allow-Methods: GET, POST, OPTIONS
           Access-Control-Allow-Headers: Content-Type
```

---

## Padrão MVC Adaptado

```
              MODEL                VIEW              CONTROLLER
           (Backend)            (Frontend)          (Backend)

   ┌─────────────────┐    ┌──────────────────┐    ┌──────────────┐
   │  Database       │    │  HTML/CSS/JS     │    │  Flask       │
   │  ├── consumo   │    │  ├── index.html │    │  ├── Routes │
   │  ├── setores   │    │  ├── style.css  │    │  ├── Logic  │
   │  ├── logs      │    │  └── script.js  │    │  └── API    │
   │  └── alertas   │    │                  │    │             │
   └────────┬────────┘    └────────┬─────────┘    └────────┬────┘
            │                      │                      │
            │◀─────────────────────┤─────────────────────▶│
            │      Requisições SQL │ Requisições HTTP   │
            │                      │                      │
            └──────────────────────┴──────────────────────┘
                   ▲
                   │
            Apresentação integrada
              ao usuário final
```

---

## Segurança e Compliance

```
┌────────────────────────────────────────────────┐
│          CAMADAS DE SEGURANÇA                  │
├────────────────────────────────────────────────┤
│                                                │
│  NÍVEL 1: Entrada                            │
│  ├── CORS: Validar origem                    │
│  ├── Content-Type: application/json          │
│  └── CSRF: tokens (futuro)                   │
│                                                │
│  NÍVEL 2: Processamento                      │
│  ├── Input Validation: regex, types          │
│  ├── SQL Injection: prepared statements      │
│  └── XSS Prevention: sanitização             │
│                                                │
│  NÍVEL 3: Persistência                       │
│  ├── Logs: auditoria de tudo                │
│  ├── LGPD: consentimento, retenção          │
│  └── Integridade: constraints, triggers      │
│                                                │
│  NÍVEL 4: Transporte (Futuro)                │
│  ├── HTTPS: criptografia em trânsito        │
│  └── JWT: autenticação com tokens           │
│                                                │
└────────────────────────────────────────────────┘
```

---

## Escalabilidade (Roadmap)

```
PRESENTE (V1.0)          FUTURO (V2.0)           AVANÇADO (V3.0)

┌──────────────┐      ┌────────────────┐      ┌──────────────────┐
│   Local      │      │    Escalável   │      │   Corporativo    │
├──────────────┤      ├────────────────┤      ├──────────────────┤
│              │      │                │      │                  │
│ Frontend     │      │ Frontend       │      │ Frontend         │
│ (1 servidor) │      │ (CDN)          │      │ (Multi-CDN)      │
│              │      │                │      │                  │
│ Backend      │      │ Backend        │      │ Backend          │
│ (1 servidor) │      │ (Load Balancer)│      │ (Kubernetes)     │
│              │      │ (2-5 instances)│      │ (Auto-scaling)   │
│              │      │                │      │                  │
│ Database     │      │ Database       │      │ Database         │
│ (SQLite)     │      │ (PostgreSQL)   │      │ (PostgreSQL +    │
│              │      │ (Replicado)    │      │  Redis Cache)    │
│              │      │                │      │                  │
│ Cache: nada  │      │ Cache: Redis   │      │ Cache: Redis     │
│              │      │                │      │ IoT: MQTT broker │
│              │      │                │      │ ML: TensorFlow   │
└──────────────┘      └────────────────┘      └──────────────────┘

┌──────────────┐      ┌────────────────┐      ┌──────────────────┐
│   ~10 req/s  │      │  ~500 req/s    │      │  ~5000+ req/s    │
│   3 setores  │      │  50 setores    │      │  500+ setores    │
│   1 empresa  │      │  10 empresas   │      │  1000 empresas   │
└──────────────┘      └────────────────┘      └──────────────────┘
```

---

## Índices e Performance

```
ÍNDICES CRIADOS (otimização de query)

idx_consumo_setor       ├─ Busca por setor
idx_consumo_data        ├─ Filtro por data
idx_consumo_status      ├─ Filtro por status
idx_logs_timestamp      ├─ Busca por timestamp
idx_alertas_setor_id    ├─ Alertas por setor
idx_usuarios_email      └─ Login por email

IMPACTO:
┌──────────────┬──────────┬──────────┐
│ Operação     │ Sem idx  │ Com idx  │
├──────────────┼──────────┼──────────┤
│ GET consumo  │ ~50ms    │ ~2ms     │
│ Filter setor │ ~100ms   │ ~5ms     │
│ Sort por data│ ~80ms    │ ~3ms     │
└──────────────┴──────────┴──────────┘
```

---

**Este diagrama detalha a arquitetura completa do EcoFlow, desde a interface do usuário até o armazenamento de dados em banco relacional.**

