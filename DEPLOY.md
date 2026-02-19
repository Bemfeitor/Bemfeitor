# 🚀 Deploy para GitHub

## Status Atual
✅ Código commitado localmente e pronto para push

## Como fazer o Deploy

### Opção 1: Criar novo repositório (Recomendado)

1. Acesse: https://github.com/new
2. Nome do repositório: `audit-cobrancas`
3. Descrição: `Sistema de Gestão de Cobranças e Emissão de Boletos Bradesco`
4. Deixe como **Público**
5. NÃO inicialize com README (já temos)
6. Clique em **Create repository**

7. Execute estes comandos no terminal:
```bash
cd allanturing.bradesco
git remote remove origin
git remote add origin https://github.com/SEU_USUARIO/audit-cobrancas.git
git push -u origin main
```

### Opção 2: Fork do repositório original

1. Acesse: https://github.com/JhonatanGabrelTI/allanturing.bradesco
2. Clique em **Fork** (canto superior direito)
3. Escolha sua conta pessoal
4. Depois execute:
```bash
cd allanturing.bradesco
git remote remove origin
git remote add origin https://github.com/SEU_USUARIO/allanturing.bradesco.git
git push -f origin main
```

## 🔧 Configurar Git (se necessário)

Se der erro de permissão, configure suas credenciais:

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@exemplo.com"
```

## 📋 O que foi incluído no commit

- ✅ Dashboard completo Audit-Cobranças
- ✅ Cálculo de código de barras FEBRABAN 44 posições
- ✅ Interface de emissão de boletos
- ✅ Gestão de clientes
- ✅ Tema dark e design responsivo
- ✅ Portas 3002 (backend) e 3003 (frontend)

## 🌐 URL do Repositório

Após o deploy, seu projeto estará em:
`https://github.com/SEU_USUARIO/audit-cobrancas`
