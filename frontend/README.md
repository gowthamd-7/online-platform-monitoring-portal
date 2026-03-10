# Online Platform Monitoring Portal - Frontend

A modern React + TypeScript application with AI-themed professional design.

## Features

- ✨ Modern React 18 + TypeScript
- 🎨 Minimal AI Professional Theme (White, Navy, Cyan)
- 🔐 Authentication with dummy credentials
- 🎯 Separate Student & Teacher Dashboards
- 🚀 Vite for lightning-fast development
- 📱 Fully Responsive Design
- ✨ Smooth Animations & Micro-interactions

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Navigate to the frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and visit: `http://localhost:3000`

## Demo Credentials

### Student Login

- **Email:** students.bitsathy.ac.in
- **Password:** 123456

### Teacher Login

- **Email:** teacher.bitsathy.ac.in
- **Password:** 123456

## Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Login.tsx          # Login page with authentication
│   │   ├── Login.css          # Login page styles
│   │   ├── StudentDashboard.tsx
│   │   ├── TeacherDashboard.tsx
│   │   └── Dashboard.css      # Dashboard styles
│   ├── App.tsx                # Main app with routing
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Backend Integration

The frontend is configured to proxy API requests to the backend at `http://localhost:8000`.

All requests to `/api/*` will be forwarded to the FastAPI backend.

Example API call:

```typescript
const response = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username, password }),
});
```

## Theme Colors

- **White:** #FFFFFF
- **Navy:** #1E2A78
- **Cyan:** #00D4FF
- **Gray Background:** #F5F7FA

## Technologies Used

- React 18
- TypeScript
- React Router DOM
- Vite
- CSS3 with CSS Variables
