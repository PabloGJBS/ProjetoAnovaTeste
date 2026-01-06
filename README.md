# Anova Investimentos - Sistema de Gestão de Títulos

Sistema de gestão de investimentos em renda fixa para a Anova Investimentos. Permite gerenciar catálogo de títulos, cadastrar clientes e registrar alocações.

## 🚀 Funcionalidades

- **Catálogo de Títulos**: Importação e visualização de títulos de renda fixa (CDB, LCA, LCI, etc.)
- **Gestão de Clientes**: Cadastro e gerenciamento de clientes
- **Alocações**: Registro de alocações de títulos para clientes
- **Dashboard**: Visualização de portfólio e distribuição de investimentos
- **Autenticação**: Sistema de login com usuários admin e clientes

## 📋 Requisitos

- Docker e Docker Compose

## ⚡ Início Rápido

### Com Docker Compose

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/projeto-financas.git
cd projeto-financas

# Suba os containers
docker compose up --build

# Acesse:
# - Frontend: http://localhost:8001
# - Backend API: http://localhost:8000
# - Swagger Docs: http://localhost:8000/docs
```

### Desenvolvimento Local

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou: venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 👥 Usuários Padrão

O sistema já vem com usuários pré-configurados para demonstração:

### Administrador
| Email | Senha |
|-------|-------|
| admin@financas.local | admin123 |

### Clientes Demo (com alocações)
| Nome | Email | Senha |
|------|-------|-------|
| Gustavo | gustavo@email.com | 123456 |
| Ana | ana@email.com | 123456 |
| Maria | maria@email.com | 123456 |

> Os clientes demo já possuem alocações de títulos criadas automaticamente.

## 🔧 Variáveis de Ambiente

### Backend (`backend/.env`)
```env
DATABASE_URL=sqlite:///./app.db
ADMIN_KEY=carecaBrilhosa
ADMIN_EMAIL=admin@financas.local
ADMIN_PASSWORD=admin123
AUTH_SALT=seu_salt_seguro
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_ADMIN_KEY=carecaBrilhosa
NEXT_PUBLIC_ADMIN_EMAIL=admin@financas.local
NEXT_PUBLIC_ADMIN_PASSWORD=admin123
```

## 📡 API Endpoints

### Autenticação
- `POST /api/v1/auth/register` - Registrar novo usuário
- `POST /api/v1/auth/login` - Login

### Títulos
- `GET /api/v1/titles` - Listar todos os títulos
- `GET /api/v1/titles?type=CDB` - Filtrar por tipo
- `POST /api/v1/import/titles` - Importar títulos (Admin)

### Clientes
- `GET /api/v1/clients` - Listar clientes
- `POST /api/v1/clients` - Cadastrar cliente
- `GET /api/v1/clients/{id}` - Buscar cliente

### Alocações
- `POST /api/v1/allocations` - Criar alocação
- `GET /api/v1/allocations/client/{id}/portfolio` - Portfólio do cliente
- `GET /api/v1/allocations/recent` - Alocações recentes (Admin)

### Exemplos cURL

**Importar títulos (Admin):**
```bash
curl -X POST "http://localhost:8000/api/v1/import/titles" \
  -H "X-ADMIN-KEY: carecaBrilhosa" \
  -F "file=@./arquivo.csv"
```

**Cadastrar cliente:**
```bash
curl -X POST "http://localhost:8000/api/v1/clients" \
  -H "Content-Type: application/json" \
  -d '{"name":"João","document":"12345678900","email":"joao@email.com"}'
```

**Criar alocação:**
```bash
curl -X POST "http://localhost:8000/api/v1/allocations" \
  -H "Content-Type: application/json" \
  -d '{"client_id":1,"title_id":"id-do-titulo","amount":50000}'
```

## 🏗️ Arquitetura

```
projeto-financas/
├── backend/                 # API FastAPI
│   ├── app/
│   │   ├── api/            # Endpoints
│   │   ├── core/           # Configurações e segurança
│   │   ├── db/             # Modelos e sessão do banco
│   │   ├── repositories/   # Acesso a dados
│   │   ├── schemas/        # Schemas Pydantic
│   │   └── services/       # Lógica de negócio
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/               # Next.js 16 + React 19
│   ├── src/
│   │   ├── app/           # Rotas (App Router)
│   │   ├── components/    # Componentes reutilizáveis
│   │   └── lib/           # Utilitários
│   └── Dockerfile
└── docker-compose.yml
```

## 🛠️ Stack Tecnológica

### Backend
- **FastAPI** - Framework web Python
- **SQLAlchemy** - ORM
- **SQLite** - Banco de dados
- **Uvicorn** - Servidor ASGI

### Frontend
- **Next.js 16** - Framework React
- **React 19** - Biblioteca UI
- **Tailwind CSS 4** - Estilização
- **Recharts** - Gráficos

## 📝 Decisões Técnicas

- **FastAPI**: Escolhido pela simplicidade, performance e documentação automática (Swagger)
- **SQLite**: Persistência simples e local, ideal para demonstração
- **Next.js App Router**: Arquitetura moderna com Server Components
- **Tailwind CSS v4**: CSS utility-first com configuração simplificada
- **Docker Compose**: Setup de desenvolvimento e produção unificado

## 🔐 Segurança

- Senhas hasheadas com PBKDF2-SHA256
- Header `X-ADMIN-KEY` para operações administrativas
- Validação de dados com Pydantic
- CORS configurado para origens permitidas

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais.
