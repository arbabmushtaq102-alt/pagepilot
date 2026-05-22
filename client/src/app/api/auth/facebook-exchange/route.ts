import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { shortLivedToken } = await request.json();
    
    if (!shortLivedToken) {
      return NextResponse.json({ error: 'Missing shortLivedToken' }, { status: 400 });
    }

    const appId = process.env.NEXT_PUBLIC_META_APP_ID || "1633126671278758";
    const appSecret = process.env.META_APP_SECRET || "4d6348e853339a26f0ae1dabbebe22e4";

    if (!appSecret) {
      console.error("META_APP_SECRET is not defined in environment variables");
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // 1. Exchange short-lived User Token for a Long-Lived User Token (valid 60 days)
    const exchangeUrl = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`;
    
    const exchangeRes = await fetch(exchangeUrl);
    const exchangeData = await exchangeRes.json();

    if (exchangeData.error) {
      console.error("Token exchange failed:", exchangeData.error);
      return NextResponse.json({ error: exchangeData.error.message }, { status: 400 });
    }

    const longLivedUserToken = exchangeData.access_token;

    // 2. Fetch User Profile using the Long-Lived User Token
    const profileRes = await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name,picture&access_token=${longLivedUserToken}`);
    const profileData = await profileRes.json();

    // 3. Fetch Page Access Tokens using the Long-Lived User Token. 
    // These resulting Page Access Tokens will be NEVER-EXPIRING.
    const pagesRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token,category,picture&access_token=${longLivedUserToken}`);
    const pagesData = await pagesRes.json();

    return NextResponse.json({
      longLivedUserToken,
      profile: profileData,
      pages: pagesData.data || []
    });

  } catch (error: any) {
    console.error("Facebook Token Exchange Error:", error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
