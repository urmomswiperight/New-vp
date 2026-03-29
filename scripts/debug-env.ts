import "dotenv/config";
console.log('DATABASE_URL from dotenv/config:', process.env.DATABASE_URL)

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
console.log('DATABASE_URL from .env.local:', process.env.DATABASE_URL)
