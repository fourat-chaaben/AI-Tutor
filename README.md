# AI Tutor  
**Next.js · TypeScript · Docker**

A small full-stack tutoring web application built with **Next.js App Router** and **TypeScript**.  
The frontend manages chat state, while a server-side API route generates tutor-style answers.

> Includes **Demo Mode** (works without paid API quota)  
> OpenAI integration is fully wired and production-structured (server-only, env-based)

---

## Features
- Chat UI with local conversation history (localStorage)
- Server-side API route (`/api/tutor`) with safe secret handling
- Clean and predictable error propagation
- Docker-based local development workflow
- Demo mode for offline / quota-free usage

---

## Tech Stack
- **Next.js** (App Router)
- **React** + **TypeScript**
- **Docker** (development container)
- **OpenAI API** (optional; disabled in Demo Mode)

---

## Quickstart (Docker)

### 1️⃣ Create environment file
Copy the example file:
```bash
cp .env.example .env.local
````

---

### 2️⃣ Start Docker container

```bash
docker run --rm -it `
  -p 3000:3000 `
  -v ${PWD}:/app `
  -v titanom_node_modules:/app/node_modules `
  -w /app `
  --env-file .env.local `
  node:24-alpine sh
```

---

### 3️⃣ Inside the container

```bash
npm install
npm run dev -- --hostname 0.0.0.0 --port 3000
```

Open in browser:
**[http://localhost:3000](http://localhost:3000)**

---

## Demo Mode (No API Key Required)

Enable demo mode in `.env.local`:

```env
DEMO_MODE=true
```

The API will return a tutor-style mock response without making external API calls.
This allows full UI and system demos without OpenAI billing.

---

## OpenAI Mode

Disable demo mode and add your API key:

```env
DEMO_MODE=false
OPENAI_API_KEY=your_api_key_here
```

> Requires an active OpenAI project with available quota.

---

## Project Structure

```
src/
├─ app/
│  ├─ page.tsx              # Chat UI (client)
│  ├─ layout.tsx            # Root layout
│  └─ api/
│     └─ tutor/
│        └─ route.ts        # Server-only OpenAI / Demo API route
```

---

## Architecture Notes

* Client and server responsibilities are strictly separated
* Secrets are handled exclusively server-side
* Environment variables control runtime behavior
* External API errors are normalized before reaching the UI

---

## Notes

* `.env.local` is intentionally excluded from version control
* This project focuses on **architecture and data flow**, not UI polish
* Designed to be easily extended with streaming responses or persistence

---

## License

MIT

```
