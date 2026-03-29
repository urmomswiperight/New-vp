# Step 1: Discover Table Names

Please run this single line in your **Supabase SQL Editor**:

```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

**Tell me what names you see in the output (especially anything like Lead, lead, or leads).** 

Once I have the exact name, I will give you the final SQL to create the `LeadDraft` table!
