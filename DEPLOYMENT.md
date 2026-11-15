# ETP – EPR Bazaar | Build & Deployment Guide

**Operator:** NYANVI ECOCLEAN PRIVATE LIMITED (`CIN: U38220WB2024PTC274770`)  
**Production Domain:** `https://etp.eprbazaar.com`  
**Firebase Project:** `intense-brook-3fs6l`  
**Firestore Database:** `ai-studio-etpeprbazaar-43fa5c66-e0d4-4e50-8298-07d3c23960cf`

---

## 1. Local Setup & Production Build

```bash
npm install
npm run lint
npm run rules:lint
npm run build
```

- `npm run build` outputs the production static bundle to `dist/`.
- `npm run preview` serves the compiled `dist/` bundle locally on port `3000`.

---

## 2. Deploy to Firebase Hosting, Firestore & Storage

1. Install Firebase CLI (if not already installed):
   ```bash
   npm install -g firebase-tools
   firebase login
   ```
2. Deploy Hosting + Firestore Rules + Firestore Indexes + Storage Rules:
   ```bash
   npm run deploy:firebase
   ```
   *(Or deploy specific targets: `firebase deploy --only hosting`, `firebase deploy --only firestore`, `firebase deploy --only storage`.)*

---

## 3. Firebase Console Production Checklist

1. **Authentication → Settings → Authorized domains**:
   - Add `etp.eprbazaar.com` and `www.etp.eprbazaar.com` (in addition to `intense-brook-3fs6l.firebaseapp.com`).
2. **Authentication → Sign-in method**:
   - Ensure **Google** is enabled (Buyers, Sellers, Super Admin).
   - Ensure **Email/Password** is enabled for `@eprbazaar.com` Facilitators and Admin accounts provisioned via Admin Portal.
   - Ensure staff Email/Password accounts have verified email status (`emailVerified = true`) so Firestore security rules permit authenticated access.
3. **Hosting → Custom domain**:
   - Connect `etp.eprbazaar.com` in Firebase Hosting and configure DNS TXT/A records.
4. **Storage**:
   - Verify `storage.rules` is deployed for `intense-brook-3fs6l.firebasestorage.app`.

---

## 4. Alternative Static Hosting (Vercel / Netlify / Nginx / Cloud Run)

Deploy the generated `dist/` directory with SPA history fallback routing all unmatched routes to `/index.html`.
