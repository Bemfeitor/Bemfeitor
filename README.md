# 🚀 Audit-Cobranças

Sistema completo de gestão de cobranças e emissão de boletos integrado com a API do Bradesco.

![Dashboard](https://img.shields.io/badge/Dashboard-Dark%20Theme-blue)
![Node](https://img.shields.io/badge/Node-18+-green)
![React](https://img.shields.io/badge/React-18+-cyan)

## ✨ Funcionalidades

### 📊 Dashboard de Cobranças
- Visualização de KPIs (Total Emitido, Pago, Em Aberto, Protestados)
- Tabela de boletos com filtros e paginação
- Status em tempo real (Pago, Vencido, Em Aberto, Protestado)
- Tema dark moderno e responsivo

### 📝 Emissão de Boletos
- Formulário de emissão individual
- Upload em lote (CSV/XLSX)
- Cálculo automático de código de barras FEBRABAN 44 posições
- Geração de linha digitável com DV (Módulo 10 e 11)
- Visualização de PDF do boleto

### 👥 Gestão de Clientes
- Cadastro de clientes (pagadores)
- Importação em massa
- Listagem com busca e filtros
- Status de crédito (Regular, Restrito, Análise)

## 🛠️ Tecnologias

**Backend:**
- NestJS
- Prisma ORM + SQLite
- Axios (integração Bradesco API)
- Puppeteer (geração de PDF)

**Frontend:**
- React 18
- CSS-in-JS (estilos inline)
- Axios (comunicação com API)

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Backend (Porta 3002)

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run start:dev
```

### Frontend (Porta 3003)

```bash
cd frontend
npm install
npm start
```

### Acesso
- Frontend: http://localhost:3003
- API: http://localhost:3002
- Swagger: http://localhost:3002/api

## 📁 Estrutura do Projeto

```
audit-cobrancas/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── boleto/
│   │   │   │   ├── boleto.controller.ts
│   │   │   │   ├── boleto.service.ts
│   │   │   │   ├── boleto.utils.ts      # Cálculo FEBRABAN
│   │   │   │   └── bradesco-api.service.ts
│   │   │   ├── cliente/
│   │   │   └── webhook/
│   │   └── main.ts
│   └── prisma/
│       └── schema.prisma
├── frontend/
│   └── src/
│       └── App.js                       # Dashboard completo
└── docker-compose.yml
```

## 🔐 Configuração do Banco

O projeto utiliza SQLite por padrão. O banco de dados está em:
`backend/prisma/dev.db`

## 📋 Cálculo de Código de Barras

Implementação completa do padrão FEBRABAN 44 posições:

```
Posições:
01-03: Código do Banco (237 = Bradesco)
04-04: Código da Moeda (9 = Real)
05-05: DV Geral (Módulo 11)
06-09: Fator de Vencimento
10-19: Valor
20-44: Campo Livre Bradesco
```

## 📝 Licença

MIT

---

Desenvolvido com 💙 para gestão de cobranças
