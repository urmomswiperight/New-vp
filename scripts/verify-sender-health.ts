import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function verifyHealth() {
  const accounts = await prisma.senderAccount.findMany();
  console.log(`Verifying health for ${accounts.length} accounts...`);

  for (const account of accounts) {
    console.log(`\nTesting: ${account.email}...`);
    
    const transporter = nodemailer.createTransport({
      host: account.smtpHost,
      port: account.smtpPort,
      secure: account.smtpPort === 465,
      auth: {
        user: account.email,
        pass: account.smtpPassword,
      },
      connectionTimeout: 10000, // 10s
    });

    try {
      await transporter.verify();
      console.log(`✅ ${account.email}: SMTP OK`);
    } catch (error: any) {
      console.error(`❌ ${account.email}: SMTP FAILED - ${error.message}`);
    }
  }

  await prisma.$disconnect();
}

verifyHealth().catch(console.error);
