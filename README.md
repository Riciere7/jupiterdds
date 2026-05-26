# Plataforma DDS

Projeto inicial para a plataforma de Controle de DDS.

## Tecnologias

- Backend: Node.js + Express
- Banco: SQLite (fácil para começar, mas pode migrar para MySQL/PostgreSQL)
- Frontend: React + Vite

## Estrutura principal

- Cadastro de DDS com título, descrição, operador, data, cidade, anexos e status
- Filtros por operador, dia, mês, ano, estado/cidade, inclusão de desabilitados e conferido
- Lista de cidades por botões
- Painel lateral de anexos com ações de visualizar/excluir

## Como usar

1. Abra dois terminais.
2. No backend:
   - `cd backend`
   - `npm install`
   - `npm run dev`
3. No frontend:
   - `cd frontend`
   - `npm install`
   - `npm run dev`

O frontend será aberto em `http://localhost:3000` e o backend em `http://localhost:4000`.

## Login padrão

- E-mail: `admin@dds.com`
- Senha: `admin123`

## Próximos passos

- Adicionar autenticação e perfil de usuário
- Criar endpoints de anexos DDS
- Implementar listagem e edição real de DDS
- Migrar os dados para MySQL/PostgreSQL quando necessário
