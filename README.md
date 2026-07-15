<div align="center">

# coreSHell

**A distributed, sandboxed shell service deployed on AWS**

Run authenticated terminal sessions in the cloud — each user gets an isolated Docker container with a custom-built Python shell, streamed in real time over WebSockets.

[![Live Demo](https://img.shields.io/badge/Live-core--shell.vercel.app-000?style=for-the-badge&logo=vercel&logoColor=white)](https://core-shell.vercel.app)
[![Backend](https://img.shields.io/badge/API-coreshell.v0x9.space-232F3E?style=for-the-badge&logo=amazonaws&logoColor=white)](https://coreshell.v0x9.space/health)

</div>

---

## Overview

coreSHell is a full-stack distributed shell platform that provisions per-user sandboxed terminal environments in the cloud. Each authenticated user is assigned a dedicated Docker container running a custom Python shell, with I/O streamed bidirectionally through Socket.IO. Sessions are persisted, resumable, and automatically reaped after inactivity through a Redis-backed lifecycle manager.

The system is designed to demonstrate real-world backend engineering — container orchestration, real-time communication, session state management, and production-grade deployment on AWS infrastructure.

---

## Architecture

```
┌──────────────────┐         HTTPS          ┌────────────────────────────────────────────┐
│                  │ ◄────────────────────►  │              AWS EC2 Instance              │
│   React Client   │                         │                                            │
│   (Vercel CDN)   │    WebSocket / REST      │  ┌─────────┐    ┌──────────────────────┐  │
│                  │ ◄──────────────────────► │  │  Nginx   │───►│   Node.js Backend    │  │
│  ┌────────────┐  │                         │  │  :80     │    │   (Express + IO)     │  │
│  │  xterm.js  │  │                         │  └─────────┘    │                      │  │
│  │  Terminal   │  │                         │                  │  ┌────────────────┐  │  │
│  └────────────┘  │                         │                  │  │ SandboxManager │  │  │
│                  │                         │                  │  │  (Dockerode)   │──┼──┤
└──────────────────┘                         │                  │  └────────────────┘  │  │
                                             │                  │                      │  │
                                             │                  │  ┌────────────────┐  │  │
                                             │                  │  │ Session Reaper │  │  │
                                             │                  │  │  (Redis PubSub)│  │  │
                                             │                  │  └────────────────┘  │  │
                                             │                  └──────────────────────┘  │
                                             │                                            │
                                             │  ┌──────────────────────────────────────┐  │
                                             │  │  Sandbox Containers (per-user)       │  │
                                             │  │  ┌──────────┐ ┌──────────┐           │  │
                                             │  │  │ Python   │ │ Python   │  ...      │  │
                                             │  │  │ Shell    │ │ Shell    │           │  │
                                             │  │  │ (128MB)  │ │ (128MB)  │           │  │
                                             │  │  └──────────┘ └──────────┘           │  │
                                             │  └──────────────────────────────────────┘  │
                                             └────────────────────────────────────────────┘
                                                         │                │
                                              ┌──────────┘                └──────────┐
                                              ▼                                      ▼
                                    ┌──────────────────┐                  ┌───────────────┐
                                    │  PostgreSQL      │                  │    Redis      │
                                    │  (Aiven Cloud)   │                  │ (Aiven Cloud) │
                                    └──────────────────┘                  └───────────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React, TypeScript, xterm.js | Terminal UI with theming and WebSocket I/O |
| **Backend** | Node.js, Express, Socket.IO | REST API, WebSocket server, container orchestration |
| **Shell** | Python 3.12 | Custom POSIX-like shell with builtins, pipes, and I/O redirection |
| **Containers** | Docker, Dockerode | Per-user sandboxed environments (128MB RAM, 1 CPU) |
| **Database** | PostgreSQL (Aiven) | User accounts, session metadata |
| **Cache** | Redis (Aiven) | Session cache, disconnect timers, keyspace expiration events |
| **Reverse Proxy** | Nginx | Request routing, WebSocket upgrade handling |
| **Infrastructure** | AWS EC2, Vercel, Docker Compose | Backend hosting, frontend CDN, orchestration |
| **Auth** | JWT, bcrypt | Stateless authentication for REST and WebSocket connections |

---

## Key Engineering Decisions

### Container-per-User Isolation
Each terminal session runs inside a dedicated Docker container with hard resource limits (128MB RAM, 1 CPU core). Containers are created, attached, and destroyed programmatically via Dockerode through the Docker socket. This provides OS-level isolation between users without the overhead of virtual machines.

### Real-Time Bidirectional I/O
Terminal input and output are streamed over Socket.IO rather than polling-based REST. The backend attaches directly to the container's stdin/stdout streams and bridges them to the client socket. This enables sub-50ms latency for keystroke-to-display round trips.

### Session Lifecycle with Redis-Backed Reaper
When a user disconnects, their container is not immediately destroyed. Instead, the session enters a `PAUSED` state, and a 10-minute TTL key is written to Redis. If the user reconnects within the window, the TTL is cleared and the session resumes from exactly where it left off. If the key expires, Redis publishes a keyspace notification that triggers the Reaper process to terminate the container and update the database record — eliminating orphaned containers without polling.

### Multi-Layer Caching Strategy
Session-to-container mappings are cached in Redis to avoid repeated database lookups on every terminal interaction. Cache misses fall through to PostgreSQL, and the cache is automatically repopulated. This reduces database load during active terminal sessions to near-zero.

### JWT Authentication Across Protocols
Authentication is enforced at both the HTTP (Express middleware) and WebSocket (Socket.IO middleware) layers using the same JWT verification logic. WebSocket connections authenticate via the `handshake.auth.token` field, ensuring that terminal sessions cannot be hijacked or opened without valid credentials.

---

## Project Structure

```
coreSHell/
├── backend/                    # Node.js backend service
│   ├── src/
│   │   ├── auth/               # JWT utilities, Express & Socket.IO middleware
│   │   ├── database/           # Sequelize connection with SSL (Aiven)
│   │   ├── models/             # User, Session (Sequelize ORM)
│   │   ├── redis/              # Redis client, SessionCache
│   │   ├── routes/             # REST API (auth: register, login, me)
│   │   ├── sandbox/            # SandboxManager (Dockerode), Reaper (Redis PubSub)
│   │   ├── services/           # SessionService (create, attach, resize, destroy)
│   │   ├── socket/             # Socket.IO terminal handler
│   │   └── index.ts            # Server entrypoint
│   └── Dockerfile              # Multi-stage build (builder → production)
│
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── api/                # Auth API client
│   │   ├── components/         # TerminalWindow, Navbar, ThemeSelector
│   │   ├── pages/              # AuthPage, DashboardPage
│   │   ├── socket/             # Socket.IO client wrapper
│   │   └── stores/             # Zustand auth state
│   └── index.html
│
├── shell/                      # Custom Python shell (runs inside containers)
│   ├── main.py                 # Shell REPL: cd, ls, cat, echo, pipes, redirects
│   ├── core/                   # PATH resolution, tab completion, pipe executor
│   ├── builtin_cmds/           # Built-in command implementations
│   └── Dockerfile              # Python 3.12-slim + coreutils
│
├── nginx/
│   └── nginx.conf              # Reverse proxy with WebSocket upgrade support
│
└── docker-compose.prod.yml     # Production orchestration (Nginx + Backend)
```

---

## API Reference

### Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Create a new account | No |
| `POST` | `/api/auth/login` | Login, receive JWT | No |
| `GET` | `/api/auth/me` | Get current user profile | Bearer Token |

### Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Root health check (ALB target) |
| `GET` | `/health` | Service health check |

### WebSocket Events (Socket.IO)

| Event | Direction | Payload | Description |
|---|---|---|---|
| `start_terminal` | Client → Server | — | Request a new sandbox container |
| `terminal_started` | Server → Client | `{ sessionId }` | Container created, ready to attach |
| `attach_terminal` | Client → Server | `{ sessionId }` | Attach stdin/stdout to container |
| `terminal_input` | Client → Server | `{ input }` | Send keystroke to shell |
| `terminal_output` | Server → Client | `{ output }` | Receive shell output |
| `terminal_resize` | Client → Server | `{ rows, cols }` | Resize container PTY |
| `terminal_exit` | Server → Client | — | Container stream ended |
| `terminal_error` | Server → Client | `{ message }` | Error message |

---

## Local Development

### Prerequisites

- Node.js ≥ 20
- Docker Engine
- PostgreSQL instance (or connection string)
- Redis instance (or connection string)

### Setup

```bash
# Clone the repository
git clone https://github.com/v0x9/coreSHELL.git
cd coreSHELL

# Build the sandbox shell image
cd shell && docker build -t coreshell . && cd ..

# Backend
cd backend
cp .env.example .env    # Configure DATABASE_URL, REDIS_URL, JWT_SECRET
npm install
npm run dev

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

### Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | Secret key for signing JWTs |
| `PORT` | Backend server port (default: `3000`) |
| `VITE_API_URL` | Backend URL for the frontend client |

---

## Production Deployment

The backend runs on an **AWS EC2** instance behind an **Nginx reverse proxy** with Docker Compose. The frontend is deployed to **Vercel**.

```bash
# On the EC2 instance
git clone https://github.com/v0x9/coreSHELL.git
cd coreSHELL

# Build the sandbox image
cd shell && docker build -t coreshell . && cd ..

# Create production environment file
nano .env

# Deploy
docker compose -f docker-compose.prod.yml up -d --build

# View logs
docker compose -f docker-compose.prod.yml logs -f nginx backend
```

---

## Shell Features

The custom Python shell running inside each container supports:

- **Builtins**: `cd`, `pwd`, `echo`, `type`, `history`, `exit`
- **External commands**: `ls`, `cat`, `tail`, `grep`, and any binary on `$PATH`
- **I/O Redirection**: `>`, `>>`, `1>`, `2>`, `1>>`, `2>>`
- **Pipes**: `command1 | command2 | command3`
- **Tab completion**: Command and file path autocomplete via `readline`
- **Command history**: Persistent across sessions with `HISTFILE` support

---

## License

This project is licensed under the **Apache License 2.0** — see the [LICENSE](LICENSE) file for details.

</div>
