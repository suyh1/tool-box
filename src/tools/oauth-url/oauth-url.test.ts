import { describe, expect, it } from 'vitest'
import { buildOAuthAuthorizationUrl } from './oauth-url'

describe('buildOAuthAuthorizationUrl', () => {
  it('builds an OAuth authorization URL with standard and extra parameters', () => {
    const result = buildOAuthAuthorizationUrl({
      authorizationEndpoint: 'https://auth.example.com/oauth2/authorize',
      clientId: 'client-123',
      redirectUri: 'https://app.example.com/callback',
      responseType: 'code',
      scope: 'openid profile',
      state: 'state-1',
      codeChallenge: 'challenge',
      codeChallengeMethod: 'S256',
      extraParams: { prompt: 'consent' },
    })

    expect(result).toEqual({
      ok: true,
      url: 'https://auth.example.com/oauth2/authorize?response_type=code&client_id=client-123&redirect_uri=https%3A%2F%2Fapp.example.com%2Fcallback&scope=openid+profile&state=state-1&code_challenge=challenge&code_challenge_method=S256&prompt=consent',
    })
  })

  it('rejects invalid authorization endpoints', () => {
    expect(buildOAuthAuthorizationUrl({
      authorizationEndpoint: 'not a url',
      clientId: 'client-123',
      redirectUri: 'https://app.example.com/callback',
      responseType: 'code',
    })).toEqual({
      ok: false,
      message: '请输入有效的授权端点 URL。',
    })
  })
})
