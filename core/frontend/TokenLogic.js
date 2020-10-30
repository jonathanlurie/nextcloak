let _accessToken = null

export default class TokenLogic {
  static hasToken() {
    return _accessToken !== null
  }


  static getTokenData() {
    if (_accessToken === null) {
      return false
    }

    const tokenDataArray = _accessToken.split('.').slice(0, 2).map((b64) => JSON.parse(atob(b64)))
    return {
      header: tokenDataArray[0],
      data: tokenDataArray[1],
    }
  }


  static isTokenExpired() {
    if (_accessToken === null) {
      return true
    }

    return TokenLogic.getTokenData().data.exp < ~~(Date.now() / 1000)
  }


  static getKeycloakLoginLink() {
    return `${process.env.NEXT_PUBLIC_AUTH_SERVER}/auth/realms/${encodeURIComponent(process.env.NEXT_PUBLIC_AUTH_REALM)}/protocol/openid-connect/auth?client_id=${encodeURIComponent(process.env.NEXT_PUBLIC_CLIENT_ID)}&response_type=code&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_REDIRECT_URL)}`
  }


  static async refreshToken() {
    const tokenRes = await fetch('/api/refresh')
    const tokenData = await tokenRes.json()

    if (!tokenData.error) {
      // the token is set as global variable
      _accessToken = tokenData.data.access_token

    }

    return tokenData
  }


  static getTokenRemainingValidity() {
    if (_accessToken === null) {
      return 0
    }

    const remainingSeconds = TokenLogic.getTokenData().data.exp - ~~(Date.now() / 1000)
    return remainingSeconds <= 0 ? 0 : remainingSeconds
  }
  
}