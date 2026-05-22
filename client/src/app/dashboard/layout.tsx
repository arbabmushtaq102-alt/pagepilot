import Sidebar from "@/components/Sidebar";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check license
  let { data: license } = await supabase
    .from('licenses')
    .select('status, expires_at')
    .eq('user_id', user.id)
    .single();

  // Automatic 3-Day Trial Fallback (No DB Insert Required)
  let hasAccess = false;

  if (license && license.status === 'active') {
    if (!license.expires_at || new Date(license.expires_at) >= new Date()) {
      hasAccess = true;
    }
  }

  if (!license) {
    const trialEnds = new Date(user.created_at);
    trialEnds.setDate(trialEnds.getDate() + 3);
    
    if (new Date() < trialEnds) {
      hasAccess = true;
    }
  }

  if (!hasAccess) {
    if (license && license.expires_at && new Date(license.expires_at) < new Date()) {
      redirect('/activate?error=expired');
    } else {
      redirect('/activate');
    }
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <main className="min-h-full p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
