const fs = require('fs');

const N8N_URL = 'https://n8n-m6qo.onrender.com/api/v1';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmOGMwNDdhMy0yMTQ0LTQ0YWItYjc1ZC1jOTc2Njk3ZDk4NjgiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzczNjg4ODc2LCJleHAiOjE3NzYyMjU2MDB9._cDaik7sXH9_7H-PmB9hdkRu4S63rCXwALjlo8GBXI8';

async function pushWorkflow(filePath) {
  const workflow = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  // Format for API
  const body = {
    name: workflow.name,
    nodes: workflow.nodes,
    connections: workflow.connections,
    settings: workflow.settings
  };

  const response = await fetch(`${N8N_URL}/workflows`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-N8N-API-KEY': API_KEY
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  if (response.ok) {
    console.log(`Successfully created ${workflow.name} (ID: ${data.id})`);
    
    // Now activate it
    const activateResponse = await fetch(`${N8N_URL}/workflows/${data.id}/activate`, {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': API_KEY
      }
    });

    if (activateResponse.ok) {
      console.log(`Successfully activated ${workflow.name}`);
    } else {
      const activateData = await activateResponse.json();
      console.error(`Failed to activate ${workflow.name}:`, JSON.stringify(activateData, null, 2));
    }
    return data;
  } else {
    console.error(`Failed to push ${workflow.name}:`, JSON.stringify(data, null, 2));
  }
}

async function main() {
  await pushWorkflow('n8n_linkedin_workflow.json');
  await pushWorkflow('n8n_email_workflow.json');
}

main();
