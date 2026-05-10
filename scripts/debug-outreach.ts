import * as dotenv from 'dotenv';
import { run_worker_locally } from './linkedin-worker'; // We'll need to export the main logic or just import it

// Since linkedin-worker.ts is a standalone script, we'll just set the env vars and spawn it
import { execSync } from 'child_process';

dotenv.config({ path: '.env.local' });

async function debug() {
    const testProfile = 'https://www.linkedin.com/in/williamhgates'; // Bill Gates as a safe test
    const testMessage = 'Hi Bill, testing a new stealth automation system. Best, Robel.';

    console.log('🧪 Starting Local Debug Outreach...');
    console.log(`👤 Target: ${testProfile}`);

    try {
        // Run the worker script using npx tsx
        execSync(`npx tsx scripts/linkedin-worker.ts`, {
            env: {
                ...process.env,
                MODE: 'OUTREACH',
                PROFILE_URL: testProfile,
                MESSAGE: testMessage,
                BYPASS_SESSION_HEALTH: 'false'
            },
            stdio: 'inherit'
        });
        
        console.log('✅ Local Debug Finished.');
    } catch (e) {
        console.error('❌ Local Debug Failed. See logs above.');
    }
}

debug();
