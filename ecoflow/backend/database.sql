-- ============================================
-- ECOFLOW - Estrutura do Banco de Dados
-- SGBD: SQLite / Relacional
-- ============================================

-- Tabela 1: Consumo de Recursos
-- Armazena registros de consumo de energia, água, etc.
CREATE TABLE IF NOT EXISTS consumo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setor TEXT NOT NULL,
    data DATE NOT NULL,
    consumo REAL NOT NULL,
    status TEXT DEFAULT 'normal',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (setor) REFERENCES setores(nome)
);

-- Tabela 2: Setores/Departamentos
-- Cadastro de setores/departamentos monitorados
CREATE TABLE IF NOT EXISTS setores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    descricao TEXT,
    responsavel TEXT,
    meta_consumo REAL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela 3: Logs de Auditoria
-- Rastreamento de ações para conformidade LGPD
CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    acao TEXT NOT NULL,
    detalhes TEXT,
    usuario TEXT,
    ip_address TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela 4: Alertas
-- Registra alertas de consumo anormal
CREATE TABLE IF NOT EXISTS alertas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setor_id INTEGER NOT NULL,
    tipo TEXT NOT NULL,
    mensagem TEXT,
    valor_consumo REAL,
    data_alerta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolvido BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (setor_id) REFERENCES setores(id)
);

-- Tabela 5: Usuarios
-- Controle de acesso e conformidade LGPD
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    cargo TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    consentimento_dados BOOLEAN DEFAULT FALSE,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_atualizacao TIMESTAMP
);

-- Tabela 6: Relatorios
-- Cache de relatórios gerados
CREATE TABLE IF NOT EXISTS relatorios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    tipo TEXT,
    conteudo TEXT,
    data_geracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_gerador_id INTEGER,
    FOREIGN KEY (usuario_gerador_id) REFERENCES usuarios(id)
);

-- ============================================
-- ÍNDICES - Otimizar Buscas
-- ============================================

CREATE INDEX IF NOT EXISTS idx_consumo_setor ON consumo(setor);
CREATE INDEX IF NOT EXISTS idx_consumo_data ON consumo(data);
CREATE INDEX IF NOT EXISTS idx_consumo_status ON consumo(status);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_alertas_setor_id ON alertas(setor_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- ============================================
-- DADOS INICIAIS - Setores Padrão
-- ============================================

INSERT OR IGNORE INTO setores (nome, descricao, responsavel, meta_consumo) VALUES
('Iluminação', 'Sistema de iluminação geral do prédio', 'João Silva', 125.0),
('HVAC', 'Sistema de climatização (Aquecimento, Ventilação, Ar Condicionado)', 'Maria Santos', 360.0),
('Computadores', 'Sala de servidores e computadores', 'Pedro Oliveira', 185.0),
('Cozinha', 'Cozinha e refeitório', 'Ana Costa', 95.0),
('Limpeza', 'Equipamentos de limpeza', 'Carlos Ferreira', 55.0);

-- ============================================
-- VIEWS - Facilitam Consultas Complexas
-- ============================================

-- View: Consumo Total por Setor
CREATE VIEW IF NOT EXISTS vw_consumo_por_setor AS
SELECT 
    s.nome AS setor,
    COUNT(c.id) AS quantidade_registros,
    SUM(c.consumo) AS consumo_total,
    AVG(c.consumo) AS consumo_medio,
    MIN(c.consumo) AS consumo_minimo,
    MAX(c.consumo) AS consumo_maximo,
    MIN(c.data) AS primeira_data,
    MAX(c.data) AS ultima_data
FROM consumo c
RIGHT JOIN setores s ON c.setor = s.nome
GROUP BY s.id, s.nome
ORDER BY consumo_total DESC;

-- View: Alertas Pendentes
CREATE VIEW IF NOT EXISTS vw_alertas_pendentes AS
SELECT 
    a.id,
    s.nome AS setor,
    a.tipo,
    a.mensagem,
    a.valor_consumo,
    a.data_alerta,
    DATETIME('now') AS data_consulta
FROM alertas a
JOIN setores s ON a.setor_id = s.id
WHERE a.resolvido = FALSE
ORDER BY a.data_alerta DESC;

-- View: Relatório Diário
CREATE VIEW IF NOT EXISTS vw_relatorio_diario AS
SELECT 
    c.data,
    s.nome AS setor,
    c.consumo,
    c.status,
    s.meta_consumo,
    CASE 
        WHEN c.consumo < (s.meta_consumo * 0.8) THEN 'Baixo'
        WHEN c.consumo < s.meta_consumo THEN 'Normal'
        WHEN c.consumo < (s.meta_consumo * 1.2) THEN 'Elevado'
        ELSE 'Crítico'
    END AS categoria_consumo
FROM consumo c
JOIN setores s ON c.setor = s.nome
ORDER BY c.data DESC, s.nome;

-- ============================================
-- PROCEDURES - Lógica de Negócio
-- (Nota: SQLite não suporta procedures. Use triggers ou execução em Python)
-- ============================================

-- Trigger: Registrar log ao inserir consumo
CREATE TRIGGER IF NOT EXISTS trigger_log_consumo_insert
AFTER INSERT ON consumo
BEGIN
    INSERT INTO logs (acao, detalhes)
    VALUES ('INSERT_CONSUMO', 'Novo registro de consumo: ' || NEW.setor || ' - ' || NEW.data);
END;

-- Trigger: Registrar log ao atualizar consumo
CREATE TRIGGER IF NOT EXISTS trigger_log_consumo_update
AFTER UPDATE ON consumo
BEGIN
    INSERT INTO logs (acao, detalhes)
    VALUES ('UPDATE_CONSUMO', 'Atualizado consumo: ' || NEW.setor || ' - ' || NEW.data || ' (novo valor: ' || NEW.consumo || ')');
END;

-- Trigger: Gerar alerta se consumo exceder meta
CREATE TRIGGER IF NOT EXISTS trigger_alerta_consumo_alto
AFTER INSERT ON consumo
WHEN (SELECT meta_consumo FROM setores WHERE nome = NEW.setor) < NEW.consumo * 1.1
BEGIN
    INSERT INTO alertas (setor_id, tipo, mensagem, valor_consumo)
    SELECT 
        id,
        'ALTO',
        'Consumo acima da meta em ' || NEW.setor,
        NEW.consumo
    FROM setores
    WHERE nome = NEW.setor;
END;

-- ============================================
-- QUERIES ÚTEIS - Análises Comuns
-- ============================================

-- Query 1: Consumo médio por setor (últimos 30 dias)
-- SELECT setor, AVG(consumo) as media_consumo
-- FROM consumo
-- WHERE data >= DATE('now', '-30 days')
-- GROUP BY setor
-- ORDER BY media_consumo DESC;

-- Query 2: Detectar picos de consumo
-- SELECT setor, data, consumo
-- FROM consumo
-- WHERE consumo > (SELECT AVG(consumo) FROM consumo) * 1.3
-- ORDER BY consumo DESC;

-- Query 3: Relatório de conformidade LGPD
-- SELECT COUNT(*) as total_usuarios, SUM(CASE WHEN consentimento_dados = TRUE THEN 1 ELSE 0 END) as com_consentimento
-- FROM usuarios
-- WHERE ativo = TRUE;

-- Query 4: Estatísticas gerais
-- SELECT 
--   (SELECT COUNT(*) FROM consumo) as total_registros,
--   (SELECT COUNT(DISTINCT setor) FROM consumo) as total_setores,
--   (SELECT AVG(consumo) FROM consumo) as media_geral,
--   (SELECT SUM(consumo) FROM consumo) as consumo_total;
