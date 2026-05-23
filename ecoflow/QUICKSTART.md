# 🚀 EcoFlow - Guia de Início Rápido

## ⚡ Setup em 5 Minutos

### Pré-requisitos
- ✅ Python 3.8+ instalado
- ✅ Git instalado
- ✅ Navegador moderno (Chrome, Firefox, Safari)

### Passo 1: Clonar e Navegar

```bash
git clone https://github.com/seu-usuario/ecoflow.git
cd ecoflow
```

### Passo 2: Instalar Dependências Backend

```bash
# Windows
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Passo 3: Iniciar Backend

```bash
cd backend
python main.py
```

**Esperado:**
```
==================================================
🌿 EcoFlow - Backend de Monitoramento
==================================================

✓ Banco de dados inicializado
✓ 60 registros de consumo gerados

📚 Endpoints disponíveis:
  GET  /api/status           - Status da API
  GET  /api/consumo          - Lista de consumo
  POST /api/consumo          - Criar consumo
  GET  /api/estatisticas     - Cálculos estatísticos
  GET  /api/relatorio/<setor> - Relatório por setor

🚀 Servidor iniciando em http://localhost:5000
==================================================
```

### Passo 4: Iniciar Frontend (novo terminal)

```bash
cd frontend
python -m http.server 8000
```

**Esperado:**
```
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
```

### Passo 5: Acessar Aplicação

Abra no navegador:
```
http://localhost:8000
```

✨ **Pronto! EcoFlow está funcionando!**

---

## 📊 Primeira Interação

1. **Página inicial carrega automaticamente**
   - Dashboard mostra Média, Mediana, Moda
   - Tabela exibe 20 registros de consumo

2. **Testar Filtro**
   - Na seção "Consumo", escreva "HVAC"
   - Tabela filtra automaticamente

3. **Verificar Relatórios**
   - Rolagem para seção "Relatórios"
   - Gráfico de distribuição por setor

4. **Ver Informações**
   - Seção "Sobre" com ODS e LGPD

---

## 🔧 Troubleshooting

### Problema: "ModuleNotFoundError: No module named 'flask'"

**Solução:**
```bash
pip install -r requirements.txt
```

### Problema: "Port 5000 already in use"

**Solução:**
```bash
# Encontrar processo usando port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Matar processo (exemplo para Windows)
taskkill /PID <PID> /F
```

### Problema: CORS Error (Frontend não conecta)

**Solução:**
Certifique-se que backend está rodando em `http://localhost:5000`

### Problema: Banco de dados vazio

**Solução:**
```bash
# Backend gera dados automaticamente ao iniciar
# Se não funcionar, delete o arquivo .db:
rm backend/ecoflow_database.db
# Reinicie backend
```

---

## 📱 Testar Responsividade

### No Chrome/Firefox:
1. Abra DevTools (F12)
2. Clique em "Toggle device toolbar" (Ctrl+Shift+M)
3. Selecione dispositivos: iPhone, iPad, Android

### Testes Recomendados:
- ✅ Mobile (375px) - iPhone SE
- ✅ Tablet (768px) - iPad
- ✅ Desktop (1920px) - Monitor Full HD

---

## 🧪 Testar API com cURL

```bash
# 1. Status
curl http://localhost:5000/api/status

# 2. Listar consumo
curl http://localhost:5000/api/consumo

# 3. Filtrar por setor
curl http://localhost:5000/api/consumo?setor=HVAC

# 4. Adicionar novo consumo
curl -X POST http://localhost:5000/api/consumo \
  -H "Content-Type: application/json" \
  -d '{"setor":"Iluminação","consumo":125.0}'

# 5. Estatísticas
curl http://localhost:5000/api/estatisticas

# 6. Relatório de setor
curl http://localhost:5000/api/relatorio/HVAC
```

---

## 📈 Estrutura de Dados Automática

O backend cria automaticamente:

```
✓ 5 setores (Iluminação, HVAC, Computadores, Cozinha, Limpeza)
✓ 30 dias de histórico (60 registros)
✓ Status (normal/alerta/crítico) baseado em consumo
✓ Logs de auditoria para LGPD
```

---

## 🎯 Próximos Passos

### Após o Setup:

1. **Explorar Dashboard**
   - Entender as métricas estatísticas
   - Validar cálculos (Média, Mediana, Moda)

2. **Testar API**
   - Criar novos registros
   - Filtrar por setor
   - Gerar relatórios

3. **Ler Documentação**
   - Ver `docs/RELATORIO_ACADEMICO.md`
   - Entender arquitetura e ODS

4. **Customizar**
   - Modificar cores em `frontend/style.css`
   - Adicionar novos setores em `backend/main.py`
   - Criar novas análises

---

## 💡 Dicas de Desenvolvimento

### Adicionar novo Setor:

1. Editar `backend/database.sql`:
```sql
INSERT INTO setores (nome, descricao, meta_consumo)
VALUES ('Novo Setor', 'Descrição', 150.0);
```

2. Reiniciar backend (dados regenerados)

### Modificar Cores:

Editar `frontend/style.css`:
```css
:root {
    --primary-green: #2ecc71;  /* Mude aqui */
    --primary-blue: #3498db;   /* E aqui */
}
```

### Adicionar Novo Endpoint:

Editar `backend/main.py`:
```python
@app.route('/api/novo-endpoint', methods=['GET'])
def novo_endpoint():
    return jsonify({'resultado': 'sucesso'}), 200
```

---

## 📚 Recursos Úteis

- **Flask Docs:** https://flask.palletsprojects.com/
- **MDN Web Docs:** https://developer.mozilla.org/
- **Python 3 Docs:** https://docs.python.org/3/
- **SQLite Docs:** https://www.sqlite.org/docs.html

---

## ✅ Checklist de Validação

Após setup, validar:

- [ ] Backend responde em `http://localhost:5000/api/status`
- [ ] Frontend carrega em `http://localhost:8000`
- [ ] Dashboard exibe métricas (Média, Mediana, Moda)
- [ ] Tabela lista dados de consumo
- [ ] Filtro por setor funciona
- [ ] Responsividade em mobile/tablet/desktop
- [ ] Relatórios carregam
- [ ] Seção "Sobre" exibe ODS e LGPD

---

**🎉 Parabéns! EcoFlow está pronto para uso!**

Para mais informações, veja [README.md](../README.md) e [docs/RELATORIO_ACADEMICO.md](../docs/RELATORIO_ACADEMICO.md)

