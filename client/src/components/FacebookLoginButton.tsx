"use client";

import { useState } from "react";

export default function FacebookLoginButton({ text = "Connect Facebook Page", className = "" }: { text?: string, className?: string }) {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = () => {
    let appId = process.env.NEXT_PUBLIC_META_APP_ID;
    
    if (!appId || appId === 'YOUR_META_APP_ID') {
      const userInput = prompt("Meta Developer App ID is missing from .env.\n\nPlease enter your Facebook App ID to continue:");
      if (!userInput) return;
      appId = userInput;
    }

    setIsLoggingIn(true);

    const redirectUri = encodeURIComponent(window.location.origin + "/dashboard/settings");
    const scope = "pages_show_list,pages_read_engagement,pages_manage_metadata,pages_read_user_content,pages_messaging,business_management";
    
    window.location.href = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=token&auth_type=rerequest`;
  };

  return (
    <button 
      onClick={handleLogin}
      disabled={isLoggingIn}
      className={`group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-xl font-semibold text-lg transition-all duration-300 shadow-[0_0_20px_rgba(24,119,242,0.4)] hover:shadow-[0_0_30px_rgba(24,119,242,0.6)] hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0 ${className}`}
    >
      {isLoggingIn ? (
        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
          <path d="M23.9981 11.9991C23.9981 5.37216 18.626 0 11.9991 0C5.37216 0 0 5.37216 0 11.9991C0 17.9882 4.38789 22.9522 10.1242 23.8524V15.4676H7.07758V11.9991H10.1242V9.35553C10.1242 6.34826 11.9156 4.68714 14.6564 4.68714C15.9692 4.68714 17.3424 4.92149 17.3424 4.92149V7.87439H15.8294C14.3388 7.87439 13.8739 8.79933 13.8739 9.74824V11.9991H17.2018L16.6698 15.4676H13.8739V23.8524C19.6103 22.9522 23.9981 17.9882 23.9981 11.9991Z" />
        </svg>
      )}
      <span>{isLoggingIn ? "Redirecting..." : text}</span>
      <div className="absolute inset-0 rounded-xl ring-2 ring-white/20 ring-offset-2 ring-offset-background opacity-0 group-focus:opacity-100 transition-opacity pointer-events-none" />
    </button>
  );
}
