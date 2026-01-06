export interface ClientCredentialTokenResponse {
  access_token: string,
  token_type: string,
  expires_in: number,
}

export interface ExchangeTokenResponse {
  access_token: string,
  token_type: string,
  expires_in: number,
  refresh_token: string,
  scope: string,
}