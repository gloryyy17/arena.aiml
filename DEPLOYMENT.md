# Arena.AIML - Deployment Guide

This project is ready for 1-click cloud deployment.

---

## Option 1: Render.com (Recommended - Free & Fullstack)

Render can build and host both your **Express Backend** and **React Frontend** in a single unified web service.

### Steps:
1. Go to **[https://dashboard.render.com](https://dashboard.render.com)** and sign in with GitHub.
2. Click **New +** → **Web Service**.
3. Select your repository: `gloryyy17/arena.aiml`.
4. Choose Branch: **`demo`** (or `main` if merged).
5. Configure the following fields:
   - **Name**: `arena-aiml`
   - **Runtime**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`
   - **Instance Type**: `Free`
6. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `JWT_SECRET`: *(any secure random string)*
   - `MONGODB_URI`: *(your MongoDB Atlas connection string)*
   - `GEMINI_API_KEY`: *(optional, for live AI features)*
   - `EMAIL_USER` & `EMAIL_PASS`: *(optional, for email delivery)*
7. Click **Deploy Web Service**!
   Render will install dependencies, build the frontend (`frontend/dist`), and start the Express server which serves both the API and the React web app at your custom `https://arena-aiml.onrender.com` URL.

---

## Option 2: Vercel (Frontend) + Render (Backend)

If you prefer deploying the frontend on Vercel:

### 1. Deploy Backend on Render:
- Create a Web Service with:
  - Root directory: `backend`
  - Build Command: `npm install`
  - Start Command: `npm start`
- Note your backend URL: e.g., `https://arena-aiml-api.onrender.com`.

### 2. Deploy Frontend on Vercel:
1. Go to **[https://vercel.com](https://vercel.com)** and import `gloryyy17/arena.aiml`.
2. Select Root Directory: **`frontend`**.
3. Framework Preset: **Vite**.
4. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://arena-aiml-api.onrender.com/api`
5. Click **Deploy**!

---

## Option 3: Railway.app

1. Go to **[https://railway.app](https://railway.app)** and click **New Project** → **Deploy from GitHub repo**.
2. Select `arena.aiml` on branch `demo`.
3. Set Environment Variables (`NODE_ENV=production`, `PORT=5000`, `JWT_SECRET`).
4. Railway will automatically detect Node.js, run `npm run build`, and expose your service.
