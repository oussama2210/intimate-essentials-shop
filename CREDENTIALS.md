# 🔐 Default Admin Login Credentials

## Admin Access

**URL:** `http://localhost:8080/admin/login`

**Username:** `admin`  
**Password:** `admin123`  
**Email:** `admin@syal.dz`

---

## Database Issue Fix

The database authentication is failing with Supabase. Here are your options:

### Option 1: Fix Supabase Credentials (Recommended if you have access)
Update the password in `/backend/.env`:
```env
DATABASE_URL="postgresql://postgres.tijccbxqtcjqfxmpgrwn:YOUR_CORRECT_PASSWORD@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

Then run:
```bash
cd backend
npm run db:push
npm run db:seed
```

### Option 2: Use Local SQLite (Easier for Development)
1. Update `backend/prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

2. Update `backend/.env`:
```env
DATABASE_URL="file:./dev.db"
```

3. Run:
```bash
cd backend
npm run db:push
npm run db:seed
npm run dev
```

---

## Current Status

- ✅ **Frontend**: Running on http://localhost:8080
- ✅ **Backend**: Running on http://localhost:3001
- ❌ **Database**: Connection failed (needs credentials fix)

The app will load but won't be able to fetch/save data until database is connected.

---

## Quick Test Without Database

You can still test the UI:
1. Homepage: http://localhost:8080
2. Products page: http://localhost:8080/products (will show loading/empty)
3. Admin login: http://localhost:8080/admin/login (will fail without DB)

Once database is connected, use the credentials above to login!
