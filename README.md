# 🖥️ Ravi Mahavadiya | Backend Developer Portfolio

<div align="center">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
</div>

<br />

<div align="center">
  <h3>
    <a href="http://161.97.183.209:5001">✨ Live Demo URL</a> 
    • 
    <a href="https://github.com/ravimh-dev">📁 GitHub Profile</a> 
    • 
    <a href="https://linkedin.com/in/ravi-mahavadiya">💼 LinkedIn</a>
  </h3>
</div>

---

## 📖 About The Project

This is a personal, highly interactive system portfolio designed to showcase backend engineering capabilities in a visually rich web application. Instead of static text, it offers interactive simulations of complex backend logic, query planning, database RLS (Row-Level Security) execution, and background worker queues.

### 🌟 Key Interactive Features

<details>
<summary>📂 <b>1. Multi-Tenant Database Simulation (FARMS RLS)</b> <i>[Click to expand]</i></summary>
<br />
Simulates PostgreSQL Row-Level Security policy enforcement. 

- **Interactive Switcher:** Swap between tenants (`Gujarat AgriFert`, `Mahavir Agro`, `Patel Seeds`).
- **Simulated SQL Runner:** See how the query changes dynamically in response to tenant-context injections and database logs output in real time.
</details>

<details>
<summary>💵 <b>2. SplitMate Debt Settlement Engine</b> <i>[Click to expand]</i></summary>
<br />
Simulates an optimization algorithm to minimize transaction volume across multiple users in a shared expense pool.

- **Dynamic Solver:** Click "Run Optimization" to view the execution steps, stack memory offsets, and optimized debt allocation results in a simulated CLI interface.
</details>

<details>
<summary>⚡ <b>3. NotifyFlow BullMQ Pipeline</b> <i>[Click to expand]</i></summary>
<br />
Simulates asynchronous message queue management using BullMQ and Redis.

- **Live Flow:** Runs state transitions (waiting, active, completed) and logs for parallel job dispatchers (SMS, Email, Webhooks).
</details>

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** React 19, Vite 6, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express, Nodemailer (SMTP dispatch server), TSX (TypeScript execute runtime)
- **Tooling:** TypeScript, Lucide React

```
├── public/               # Static assets & Resume PDF
├── src/
│   ├── App.tsx           # Main Portfolio App with Interactive Simulators
│   ├── index.css         # Styling system & Tailwind rules
│   ├── main.tsx          # App Entrypoint
│   └── types.ts          # TS Type Definitions
├── server.ts             # Express App & Nodemailer API Router
├── vite.config.ts        # Vite configuration & API proxy
└── package.json          # Node scripts and dependencies
```

---

## ⚙️ Local Configuration & Setup

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **npm** or **yarn**

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory (based on the sample format):

```ini
# Server Port Configuration
PORT=4000
FRONTEND_PORT=5000

# Live URL
APP_URL="http://localhost:5000"

# SMTP Configuration for Contact Form
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-gmail-app-password" # Make sure to generate an App Password in Google Settings
EMAIL_TO="inbox-to-receive-emails@gmail.com"
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Locally (Concurrent Frontend & Backend)
Start both development environments with one command:
```bash
npm run dev
```

The frontend will start at `http://localhost:5000` (respecting `FRONTEND_PORT` env) and proxy API requests automatically to the backend at `http://localhost:4000` (respecting `PORT` env).

---

## 📡 REST API Sandbox

### Contact Endpoint
* **Method:** `POST`
* **Path:** `/api/contact`
* **Content-Type:** `application/json`

<details>
<summary>📤 <b>Example Request Body</b> <i>[Click to expand]</i></summary>

```json
{
  "name": "Jane Doe",
  "email": "janedoe@example.com",
  "message": "Hi Ravi, I would love to talk about a backend role!"
}
```
</details>

<details>
<summary>📥 <b>Example Response (Success 200 OK)</b> <i>[Click to expand]</i></summary>

```json
{
  "success": true,
  "message": "Your message has been sent successfully!"
}
```
</details>

<details>
<summary>⚠️ <b>Example Response (SMTP Error 500)</b> <i>[Click to expand]</i></summary>

```json
{
  "error": "Failed to dispatch email. Please try again later.",
  "details": "SMTP authentication failed"
}
```
</details>

---

<div align="center">
  <p>Created with ⚡ by <a href="https://github.com/ravimh-dev">Ravi Mahavadiya</a></p>
</div>
