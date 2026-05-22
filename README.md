# MetaCRM - Premium Facebook Management Dashboard

A futuristic, high-performance SaaS application for managing Facebook Pages, Messenger, and customer relationships. Built with Next.js, React, Tailwind CSS, Node.js, Express, Socket.io, and PostgreSQL.

## Architecture

This project is separated into two parts:
- **Client (`/client`)**: The Next.js frontend with a dark premium UI, glassmorphism, and smooth animations.
- **Server (`/server`)**: The Express backend for handling Meta Webhooks, Socket.io for real-time syncing, and Prisma ORM for PostgreSQL.

## Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- PostgreSQL Database
- Meta Developer Account & App

## Setup Instructions

### 1. Start the Server (Backend)

1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Setup environment variables:
   Copy `.env.example` to `.env` and fill in your database URL and Meta App credentials.
   ```bash
   cp .env.example .env
   ```
4. Setup Prisma:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
5. Start the server:
   ```bash
   npm run dev
   ```

### 2. Start the Client (Frontend)

1. Open a new terminal and navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features Built
- **Facebook Login Flow**: Connect pages directly from the dashboard.
- **Premium Dark UI**: Implemented using Tailwind CSS, featuring glassmorphism (`.glass` utility), and neon gradients.
- **Real-time Inbox**: Built with Framer Motion for smooth animations and Socket.io structure on the backend.
- **Responsive Dashboard**: Sidebar navigation, stat cards, and dynamic layouts.
- **Database Schema**: Comprehensive Prisma schema for Users, Pages, Conversations, and Messages.
- **Webhook Receiver**: Express route ready to receive Facebook Messenger webhooks.
