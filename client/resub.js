const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf-8');
const url = env.split('\n').find(l => l.startsWith('NEXT_PUBLIC_SUPABASE_URL')).split('=')[1].trim();
const key = env.split('\n').find(l => l.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY')).split('=')[1].trim();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(url, key);

async function resubscribe() {
  const { data: connections } = await supabase.from('facebook_connections').select('connected_pages');
  if (!connections) return console.log('No connections found');
  
  for (const conn of connections) {
    if (!conn.connected_pages) continue;
    for (const page of conn.connected_pages) {
      if (!page.id || !page.access_token) continue;
      try {
        const res = await fetch(`https://graph.facebook.com/v19.0/${page.id}/subscribed_apps?subscribed_fields=messages,messaging_postbacks&access_token=${page.access_token}`, { method: 'POST' });
        const json = await res.json();
        console.log(`Page ${page.name} (${page.id}):`, json);
      } catch (e) {
        console.log(`Failed for ${page.name}`, e);
      }
    }
  }
}
resubscribe();
