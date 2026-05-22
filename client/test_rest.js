const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pfobzslnrfuhhydibxcn.supabase.co';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmb2J6c2xucmZ1aGh5ZGlieGNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMTU1NDYsImV4cCI6MjA5NDU5MTU0Nn0.zskfkkBgW63dFFOiEIknTkNxb6Q3oVvMvn3ALMXLVds';

async function run() {
  const res = await fetch(`${url}/rest/v1/licenses`, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      user_id: '00000000-0000-0000-0000-000000000000',
      key: 'TRIAL-TEST',
      status: 'active',
      plan_type: 'trial'
    })
  });
  const data = await res.json();
  console.log("REST API Response:", data);
}

run();
