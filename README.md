# 📸 Gangai Studio — Event & Wedding Photo-Sharing Platform

A luxury, mobile-first wedding & event photo-sharing web application featuring **two independent web portals** in dedicated subfolders ready for separate deployments.

---

## 📁 Repository Structure

```
GANGAI WEB/
├── host-portal/           # 🚀 Host & Admin Web App (Port 3000)
│   ├── src/
│   │   ├── app/           # Next.js 14 App Router (Dashboard, Event Wizard, Bulk Uploader, QR Hub)
│   │   ├── components/    # Bulk Uploader, Photo Grid, 4x6 Printable Card Designer
│   │   └── lib/           # Supabase Client, Canvas Compressor, Storage Engine
│   ├── package.json
│   └── tailwind.config.ts
│
├── guest-portal/          # 📱 Frictionless Guest Web App (Port 3001)
│   ├── src/
│   │   ├── app/           # /[slug] Direct Zero-Friction Event Galleries
│   │   ├── components/    # Responsive Masonry Grid, Lightbox Modal, Guest Snaps FAB
│   │   └── lib/           # Direct High-Res Download Blob Engine, Web Share API
│   ├── package.json
│   └── tailwind.config.ts
│
└── supabase/              # 🗄️ Database & Storage Setup
    ├── schema.sql         # PostgreSQL DDL, RLS Policies, Indexes, and Storage Buckets
    └── seed.sql           # Curated sample wedding datasets
```

---

## ⚡ Quick Start (Local Development)

### 1. Run Host Portal (Port 3000)
```bash
cd host-portal
npm install
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** to access the Host Command Center.

### 2. Run Guest Portal (Port 3001)
```bash
cd guest-portal
npm install
npm run dev
```
Open **[http://localhost:3001/arun-divya-wedding](http://localhost:3001/arun-divya-wedding)** or scan the QR code to open the guest gallery!

---

## 🗄️ Supabase Setup & Deployment

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in Supabase and run the script in `supabase/schema.sql`.
3. In **Storage**, verify the public bucket `event-photos` was created.
4. Set environment variables or use the in-app Supabase Setup drawer:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## 🚀 Independent Production Deployments

Both folders are completely decoupled and can be deployed independently to Vercel, Netlify, or any Docker container:

- **Host Portal Deployment**: Set Root Directory in Vercel/Netlify to `host-portal`.
- **Guest Portal Deployment**: Set Root Directory in Vercel/Netlify to `guest-portal`.
