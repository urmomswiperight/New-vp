const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:Robelseife%401@127.0.0.1:5433/postgres?sslmode=disable' });
client.connect()
  .then(() => client.query('SELECT "linkedinUrl", "firstName", company FROM "Lead" WHERE "linkedinUrl" IS NOT NULL AND status = \'New\' LIMIT 1'))
  .then(res => {
    console.log(JSON.stringify(res.rows[0], null, 2));
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
