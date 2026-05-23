import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase
    .from('bot_disabled_leads')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  return NextResponse.json({ success: true, error });
}
