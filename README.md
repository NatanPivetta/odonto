# OdontoUFRGS — Frontend (Next.js)

Interface web do sistema OdontoUFRGS. Stack: **Next.js 16 (App Router) · React 19 ·
TypeScript · Tailwind CSS**.

> A documentação canônica do projeto (pré-requisitos, quick start, arquitetura, deploy)
> está no **[README da raiz do repositório](../README.md)**.

## Rodando localmente

```bash
cp .env.example .env.local   # confira NEXT_PUBLIC_API_URL (backend local = http://localhost:8090/api)
npm install
npm run dev                  # http://localhost:3000
```

O frontend consome a API descrita em `NEXT_PUBLIC_API_URL`. Suba o backend antes
(ver [README da raiz](../README.md), seção *Quick Start*).

## Organização

```
src/
├── app/          rotas (App Router): (auth) login/primeiro-acesso · (app) dashboard/atividades/alunos/administracao
├── components/   UI (ui/) e layout (layout/)
├── lib/          api.ts (cliente HTTP + token) · auth.tsx (contexto) · services/ (1 por domínio)
└── types/        tipos compartilhados (Role, enums, DTOs)
```

## Scripts

| Comando         | Descrição                       |
|-----------------|---------------------------------|
| `npm run dev`   | Servidor de desenvolvimento.    |
| `npm run build` | Build de produção.              |
| `npm start`     | Serve o build de produção.      |
| `npm run lint`  | ESLint.                         |