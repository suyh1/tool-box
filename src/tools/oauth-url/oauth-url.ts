export interface OAuthUrlOptions {
  authorizationEndpoint: string
  clientId: string
  redirectUri: string
  responseType: string
  scope?: string
  state?: string
  codeChallenge?: string
  codeChallengeMethod?: 'plain' | 'S256'
  extraParams?: Record<string, string>
}

export type OAuthUrlResult =
  | {
      ok: true
      url: string
    }
  | {
      ok: false
      message: string
    }

function appendIfValue(params: URLSearchParams, key: string, value: string | undefined) {
  if (value !== undefined && value !== '') {
    params.set(key, value)
  }
}

export function buildOAuthAuthorizationUrl(options: OAuthUrlOptions): OAuthUrlResult {
  let url: URL

  try {
    url = new URL(options.authorizationEndpoint)
  } catch {
    return { ok: false, message: '请输入有效的授权端点 URL。' }
  }

  const params = new URLSearchParams()
  appendIfValue(params, 'response_type', options.responseType)
  appendIfValue(params, 'client_id', options.clientId)
  appendIfValue(params, 'redirect_uri', options.redirectUri)
  appendIfValue(params, 'scope', options.scope)
  appendIfValue(params, 'state', options.state)
  appendIfValue(params, 'code_challenge', options.codeChallenge)
  appendIfValue(params, 'code_challenge_method', options.codeChallengeMethod)

  for (const [key, value] of Object.entries(options.extraParams ?? {})) {
    appendIfValue(params, key, value)
  }

  url.search = params.toString()
  return { ok: true, url: url.toString() }
}
