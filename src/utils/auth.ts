import { CLIENT_ID, SCOPES } from "../configs/authConfig";
import { REDIRECT_URI } from "../configs/commonConfig";
import { base64encode, generateRandomString, sha256 } from "./crypto";

export const getSpotifyAuthUrl=async()=>{
  const codeVerifier  = generateRandomString(64);
  const hashed = await sha256(codeVerifier)
  const codeChallenge = base64encode(hashed);

  const clientId = CLIENT_ID;
  const redirectUri = REDIRECT_URI;

  const scope = SCOPES;
  const authUrl = new URL("https://accounts.spotify.com/authorize")

  window.localStorage.setItem('code_verifier', codeVerifier);

  const params =  {
    response_type: 'code',
    client_id: clientId,
    scope,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    redirect_uri: redirectUri,
  }

  authUrl.search = new URLSearchParams(params).toString();
  window.location.href = authUrl.toString();
}