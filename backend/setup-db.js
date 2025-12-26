const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up Algeria E-commerce Database...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found. Please create one based on .env.example');
  process.exit(1);
}

try {
  // Generate Prisma client
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit', cwd: __dirname });
  
  // Push database schema
  console.log('\n🗄️  Pushing database schema...');
  execSync('npx prisma db push', { stdio: 'inherit', cwd: __dirname });
  
  // Run seed script
  console.log('\n🌱 Seeding database with Algeria data...');
  execSync('npx tsx src/prisma/seed.ts', { stdio: 'inherit', cwd: __dirname });
  
  console.log('\n✅ Database setup completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('   1. Start the backend server: npm run dev');
  console.log('   2. Test the API: http://localhost:3001/health');
  console.log('   3. View wilayas: http://localhost:3001/api/wilayas');
  
} catch (error) {
  console.error('\n❌ Database setup failed:', error.message);
  console.log('\n🔍 Troubleshooting:');
  console.log('   1. Make sure PostgreSQL is running');
  console.log('   2. Check your DATABASE_URL in .env file');
  console.log('   3. Ensure the database exists');
  process.exit(1);
}