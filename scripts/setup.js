const fs = require('fs')
const path = require('path')

console.log('🚀 Setting up E-Commerce Next.js Application...\n')

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local')
const envExamplePath = path.join(process.cwd(), 'env.example')

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath)
    console.log('✅ Created .env.local from env.example')
    console.log('⚠️  Please update .env.local with your actual configuration values\n')
  } else {
    console.log('❌ env.example not found. Please create .env.local manually\n')
  }
} else {
  console.log('✅ .env.local already exists\n')
}

// Check required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'PAYTM_MID',
  'PAYTM_KEY',
  'PAYTM_CALLBACK_URL'
]

console.log('📋 Checking environment variables...')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  const missingVars = requiredEnvVars.filter(varName => {
    const regex = new RegExp(`^${varName}=`, 'm')
    return !regex.test(envContent)
  })
  
  if (missingVars.length > 0) {
    console.log('⚠️  Missing environment variables:')
    missingVars.forEach(varName => {
      console.log(`   - ${varName}`)
    })
    console.log('')
  } else {
    console.log('✅ All required environment variables are present\n')
  }
}

// Display next steps
console.log('📝 Next Steps:')
console.log('1. Update .env.local with your actual values')
console.log('2. Run: npm install')
console.log('3. Run: npm run db:generate')
console.log('4. Run: npm run db:push')
console.log('5. Run: npm run db:seed')
console.log('6. Run: npm run dev')
console.log('')

console.log('🎉 Setup complete! Happy coding!')
console.log('')

console.log('📚 Default credentials after seeding:')
console.log('   Admin: admin@ecom.com / admin123')
console.log('   Customer: customer@example.com / customer123')
console.log('')

console.log('🔗 Important URLs:')
console.log('   Frontend: http://localhost:3000')
console.log('   Admin Panel: http://localhost:3000/admin')
console.log('   API: http://localhost:3000/api')
console.log('')
