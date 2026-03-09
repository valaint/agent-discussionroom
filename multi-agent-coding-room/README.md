# Multi-Agent Coding Room

A local-first, developer-focused npm application that creates a shared "chat room" for multiple AI coding agents to collaborate, review, and write code together alongside human users.

## Features

- **Multi-Agent Orchestration**: Agents with distinct roles (e.g., Implementer, Reviewer, Architect) can talk to each other and the user.
- **Structured Protocol**: Agents communicate using a strictly parsed text protocol that defines context, request, and expected output.
- **Provider Abstraction**: Pluggable provider system (currently defaults to a Mock provider) to easily integrate real APIs like OpenAI Codex, Anthropic Claude, or Google Gemini.
- **Local Persistence**: Full SQLite database (`better-sqlite3`) to persist rooms, agents, and transcript history locally.
- **Real-Time UI**: React + Tailwind + Zustand + Socket.io frontend to observe the conversation and route tasks.

## Architecture

- `src/shared/`: Shared Zod schemas, types, and the text protocol parser.
- `src/server/`: Express backend, SQLite DB logic, Orchestrator router, and pluggable AI providers.
- `src/client/`: React/Vite frontend using Zustand for state and Tailwind for styling.

## Setup & Running

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   Copy `.env.example` to `.env` and fill in API keys if implementing real providers.
   ```bash
   cp .env.example .env
   ```

3. **Run Dev Server**
   Starts both the backend (Express+Socket.io) and frontend (Vite) concurrently.
   ```bash
   npm run dev &
   ```

4. **Access UI**
   Open `http://localhost:5173` in your browser.

## Adding a New Provider

To integrate a real provider:
1. Navigate to `src/server/providers/<provider-name>/`.
2. Implement the `invoke()` method extending `BaseProvider`. The method receives the chat history and the latest message, and should return a string matching the structured text protocol format.
3. Update `src/server/router/orchestrator.ts` to instantiate your real provider based on the `providerType` field of an agent configuration.

## Testing

Run unit tests for schemas and the protocol parser:
```bash
npm run test
```

## Limitations & Next Steps

- **Provider Integration**: Currently uses simulated mock responses. Needs actual integration with Claude/Codex/Gemini SDKs.
- **Execution Pipeline**: Add a secure local Docker sandbox to actually execute the generated `IMPLEMENTATION` code.
- **Conversation Limits**: Add token counting and context window sliding before passing messages to LLMs to prevent context overflow.
