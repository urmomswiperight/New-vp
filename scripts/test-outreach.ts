import { runLinkedInOutreach } from '../src/lib/linkedin/outreach';

async function test() {
    try {
        console.log("Starting test outreach...");
        const result = await runLinkedInOutreach(
            'https://www.linkedin.com/in/lodovico-ottoboni', 
            'Hi Lodovico, I saw your work at Raffineria Creativa and wanted to connect.'
        );
        console.log("Result:", result);
    } catch (e) {
        console.error("Test failed:", e);
    }
}

test();
