# Arena AIML — Student Mobile App

A student-centric cross-platform mobile application powered by **Capacitor & React/Vite**, tailored for discovering campus events, AI recommendations, instant QR entrance passes, and conversational AI Concierge support.

---

## 📱 Mobile Features

1. **Events Feed (`/`)**:
   - Filter by categories (*Technical, Workshop, Cultural, Sports*).
   - Real-time search by title and venue.
   - 1-tap instant event registration.
2. **For You (`/recommendations`)**:
   - Multi-signal content-based AI recommendation engine.
   - Explainable percentage affinity score tailored to student department & skills.
3. **Tickets & QR Passes (`/tickets`)**:
   - Digital event boarding pass.
   - Dynamic entrance QR code for hall check-ins.
   - Registration status tracking (*Confirmed / Attended*).
4. **AI Concierge Chat (`/chat`)**:
   - Full-screen conversational assistant.
   - Grounded campus knowledge & multi-turn chit-chat.
   - Quick interactive prompt chips.
5. **Student Profile (`/profile`)**:
   - Student ID and Department card.
   - Fast login with demo student pre-fill (`student@arena.aiml` / `password123`).

---

## 🚀 Running the Mobile App

### 1. In Browser / Mobile Device Mode
Run from the root or within `mobile/`:
```bash
npm run dev:mobile
```
App will launch on `http://localhost:5174`. Open DevTools (F12) and toggle the **Device Toolbar (Ctrl+Shift+M)** to view as iPhone / Android.

### 2. On a Physical Phone (Via Local WiFi)
1. Ensure your computer and phone are connected to the same Wi-Fi network.
2. Find your PC's IP address (e.g., `192.168.1.5`).
3. Open Chrome or Safari on your phone and go to:
   `http://192.168.1.5:5174`
4. Tap **"Add to Home Screen"** or **"Install App"** to install it as a standalone PWA.

### 3. Native Android / iOS Build (Capacitor)
```bash
cd mobile

# Build web assets
npm run build

# Add native platform (one-time)
npx cap add android
# or: npx cap add ios

# Sync web assets to native
npx cap sync

# Open in Android Studio or Xcode
npx cap open android
# or: npx cap open ios
```
