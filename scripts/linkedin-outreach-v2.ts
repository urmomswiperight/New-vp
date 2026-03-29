import { runLinkedInOutreach } from '../src/lib/linkedin/outreach';

async function main() {
    const profileUrl = process.argv[2];
    const message = process.argv[3];
    const dailyLimitArg = process.argv[4];
    const dailyLimit = dailyLimitArg ? parseInt(dailyLimitArg) : 25;

    if (!profileUrl || !message) {
        console.error(JSON.stringify({ 
            success: false, 
            error: 'Missing profileUrl or message. Usage: ts-node scripts/linkedin-outreach-v2.ts <url> <message> [limit]' 
        }));
        process.exit(1);
    }

    try {
        const result = await runLinkedInOutreach(profileUrl, message, dailyLimit);
        
        if (result.success) {
            console.log(JSON.stringify(result));
        } else {
            console.error(JSON.stringify(result));
            // Exit with 0 if it's a daily limit reached to avoid n8n error alerts as per original script
            if (result.error?.includes('DAILY_LIMIT_REACHED')) {
                process.exit(0);
            }
            process.exit(1);
        }
    } catch (error: any) {
        console.error(JSON.stringify({ 
            success: false, 
            error: `UNEXPECTED_ERROR: ${error.message}` 
        }));
        process.exit(1);
    }
}

main().catch(err => {
    console.error(JSON.stringify({ success: false, error: err.message }));
    process.exit(1);
});
