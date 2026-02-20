// Google Sheets API helper functions

const GOOGLE_API_URL = "https://www.googleapis.com";

export interface GoogleSheetsConfig {
  access_token: string;
  refresh_token: string;
  token_expires_at: string;
  user_email?: string;
  user_name?: string;
}

// Build Google OAuth URL
export function buildGoogleOAuthUrl(redirectUri: string, state: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const scopes = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ].join(" ");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scopes,
    access_type: "offline",
    prompt: "consent",
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

// Exchange code for tokens
export async function exchangeGoogleCode(code: string, redirectUri: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(data.error_description || data.error);
  }

  return {
    access_token: data.access_token as string,
    refresh_token: data.refresh_token as string,
    expires_in: data.expires_in as number,
  };
}

// Refresh access token
export async function refreshGoogleToken(refreshToken: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: "refresh_token",
    }),
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(data.error_description || data.error);
  }

  return {
    access_token: data.access_token as string,
    expires_in: data.expires_in as number,
  };
}

// Get a valid access token (auto-refresh if expired)
export async function getValidToken(config: GoogleSheetsConfig): Promise<{ accessToken: string; refreshed: boolean; newExpiresAt?: string }> {
  const now = new Date();
  const expiresAt = new Date(config.token_expires_at);

  // If token still valid (with 5min buffer), use it
  if (expiresAt.getTime() - now.getTime() > 5 * 60 * 1000) {
    return { accessToken: config.access_token, refreshed: false };
  }

  // Refresh token
  const { access_token, expires_in } = await refreshGoogleToken(config.refresh_token);
  const newExpiresAt = new Date(Date.now() + expires_in * 1000).toISOString();

  return { accessToken: access_token, refreshed: true, newExpiresAt };
}

// Get user info
export async function getGoogleUserInfo(accessToken: string) {
  const res = await fetch(`${GOOGLE_API_URL}/oauth2/v2/userinfo?access_token=${accessToken}`);
  const data = await res.json();
  return { email: data.email, name: data.name };
}

// List spreadsheets from Drive
export async function listSpreadsheets(accessToken: string, maxResults = 20) {
  const query = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet'");
  const res = await fetch(
    `${GOOGLE_API_URL}/drive/v3/files?q=${query}&orderBy=modifiedTime desc&pageSize=${maxResults}&fields=files(id,name,modifiedTime)`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);

  return (data.files || []) as Array<{ id: string; name: string; modifiedTime: string }>;
}

// Get sheet names from a spreadsheet
export async function getSheetNames(accessToken: string, spreadsheetId: string) {
  const res = await fetch(
    `${GOOGLE_API_URL}/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);

  return (data.sheets || []).map((s: { properties: { title: string } }) => s.properties.title);
}

// Read data from a sheet
export async function readSheetData(accessToken: string, spreadsheetId: string, range: string) {
  const encodedRange = encodeURIComponent(range);
  const res = await fetch(
    `${GOOGLE_API_URL}/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);

  return (data.values || []) as string[][];
}

// Write data to a sheet
export async function writeSheetData(
  accessToken: string,
  spreadsheetId: string,
  range: string,
  values: (string | number)[][]
) {
  const res = await fetch(
    `${GOOGLE_API_URL}/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values }),
    }
  );

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);

  return { updatedCells: data.updatedCells, updatedRows: data.updatedRows };
}

// Append data to a sheet
export async function appendSheetData(
  accessToken: string,
  spreadsheetId: string,
  range: string,
  values: (string | number)[][]
) {
  const res = await fetch(
    `${GOOGLE_API_URL}/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values }),
    }
  );

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);

  return { updatedCells: data.updates?.updatedCells || 0 };
}
