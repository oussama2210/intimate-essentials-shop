# Supabase Connection Troubleshooting

## Issue
Getting `P1000: Authentication failed` error when connecting to Supabase.

## Correct Way to Get Connection Strings

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `tijccbxqtcjqfxmpgrwn`
3. **Go to Settings** → **Database**
4. **Scroll to "Connection string"**
5. **Switch to "URI" tab** (not "Session mode" or "Transaction mode")
6. **Copy the connection string**
7. **Replace `[YOUR-PASSWORD]` with your actual password**

## Connection String Format

Your connection string should look like this:

```env
# For pooled connection (recommended for serverless)
DATABASE_URL="postgresql://postgres.tijccbxqtcjqfxmpgrwn:[YOUR-PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# For direct connection (for migrations)
DIRECT_URL="postgresql://postgres.tijccbxqtcjqfxmpgrwn:[YOUR-PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:5432/postgres"
```

**IMPORTANT**: Replace `[YOUR-PASSWORD]` with your **actual database password** from Supabase, not the password with brackets!

## Common Mistakes

❌ **Wrong**: Using the password with URL encoding like `%5BOussama123%4045%5D`
✅ **Correct**: Using the plain password directly

❌ **Wrong**: Keeping `[YOUR-PASSWORD]` placeholder
✅ **Correct**: Replacing with actual password

## If You Don't Remember Your Password

1. In Supabase Dashboard → Settings → Database
2. Click **"Reset database password"**
3. **Copy the new password** (save it somewhere safe!)
4. Update your `.env` file with the new connection strings

## Test Connection

After updating `.env`, run:
```bash
cd backend
npx prisma db push
```

If successful, you should see:
```
✔ Generated Prisma Client
The schema has been applied
```

## Alternative: Use SQLite Locally

If Supabase continues to fail, you can use SQLite for development:

1. Update `backend/prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

2. Update schema to remove PostgreSQL-specific features
3. Run `npm run db:push`

You can always migrate back to Supabase later!
