// Facebook Marketing API helper functions

const FB_GRAPH_URL = "https://graph.facebook.com/v21.0";

export interface FacebookConfig {
  access_token: string;
  ad_account_id: string;
  token_expires_at?: string;
  user_name?: string;
  user_id?: string;
}

// Exchange code for long-lived access token
export async function exchangeCodeForToken(code: string, redirectUri: string) {
  const appId = process.env.FACEBOOK_APP_ID!;
  const appSecret = process.env.FACEBOOK_APP_SECRET!;

  // 1. Exchange code for short-lived token
  const tokenUrl = `${FB_GRAPH_URL}/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`;

  const res = await fetch(tokenUrl);
  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.message || "Erro ao obter token do Facebook");
  }

  // 2. Exchange short-lived for long-lived token (60 days)
  const longLivedUrl = `${FB_GRAPH_URL}/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${data.access_token}`;

  const longRes = await fetch(longLivedUrl);
  const longData = await longRes.json();

  if (longData.error) {
    // Fallback to short-lived token
    return { access_token: data.access_token, expires_in: data.expires_in || 3600 };
  }

  return {
    access_token: longData.access_token,
    expires_in: longData.expires_in || 5184000, // ~60 days
  };
}

// Get user info + ad accounts
export async function getFacebookUserAndAdAccounts(accessToken: string) {
  // Get user info
  const userRes = await fetch(`${FB_GRAPH_URL}/me?fields=id,name&access_token=${accessToken}`);
  const user = await userRes.json();

  if (user.error) {
    throw new Error(user.error.message || "Erro ao obter dados do usuário");
  }

  // Get ad accounts
  const accountsRes = await fetch(
    `${FB_GRAPH_URL}/me/adaccounts?fields=id,name,account_id,currency,account_status&access_token=${accessToken}`
  );
  const accounts = await accountsRes.json();

  return {
    user: { id: user.id, name: user.name },
    adAccounts: (accounts.data || []).map((acc: Record<string, unknown>) => ({
      id: acc.id,
      name: acc.name,
      account_id: acc.account_id,
      currency: acc.currency,
      account_status: acc.account_status,
    })),
  };
}

// Get campaigns from ad account
export async function getCampaigns(accessToken: string, adAccountId: string) {
  const url = `${FB_GRAPH_URL}/${adAccountId}/campaigns?fields=id,name,status,objective,daily_budget,lifetime_budget,start_time,stop_time&limit=100&access_token=${accessToken}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.message || "Erro ao obter campanhas");
  }

  return data.data || [];
}

// Get campaign insights (metrics)
export async function getCampaignInsights(
  accessToken: string,
  adAccountId: string,
  dateStart: string,
  dateEnd: string,
  level: "campaign" | "adset" | "ad" = "campaign"
) {
  const fields = [
    "campaign_name",
    "campaign_id",
    "adset_name",
    "adset_id",
    "ad_name",
    "ad_id",
    "spend",
    "impressions",
    "reach",
    "clicks",
    "cpc",
    "cpm",
    "ctr",
    "actions",
    "cost_per_action_type",
    "date_start",
    "date_stop",
  ].join(",");

  const url = `${FB_GRAPH_URL}/${adAccountId}/insights?fields=${fields}&time_range={"since":"${dateStart}","until":"${dateEnd}"}&level=${level}&limit=500&access_token=${accessToken}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.message || "Erro ao obter insights");
  }

  return data.data || [];
}

// Get ads with UTM parameters
export async function getAdsWithUtm(accessToken: string, adAccountId: string) {
  const url = `${FB_GRAPH_URL}/${adAccountId}/ads?fields=id,name,status,creative{url_tags,object_story_spec},adset{name},campaign{name}&limit=500&access_token=${accessToken}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.message || "Erro ao obter anúncios");
  }

  return data.data || [];
}

// Parse UTM parameters from URL tags string
export function parseUtmTags(urlTags: string): Record<string, string> {
  const params: Record<string, string> = {};
  if (!urlTags) return params;

  const pairs = urlTags.split("&");
  for (const pair of pairs) {
    const [key, value] = pair.split("=");
    if (key && value) {
      params[decodeURIComponent(key)] = decodeURIComponent(value);
    }
  }

  return params;
}

// Map Facebook action types to our metrics
export function extractActionsMetric(actions: Array<{ action_type: string; value: string }> | undefined, type: string): number {
  if (!actions) return 0;
  const action = actions.find((a) => a.action_type === type);
  return action ? parseInt(action.value, 10) : 0;
}

// Build the OAuth URL
export function buildFacebookOAuthUrl(redirectUri: string, state: string) {
  const appId = process.env.FACEBOOK_APP_ID!;
  const scopes = [
    "ads_read",
    "ads_management",
    "business_management",
    "read_insights",
  ].join(",");

  return `https://www.facebook.com/v21.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&state=${state}&response_type=code`;
}
