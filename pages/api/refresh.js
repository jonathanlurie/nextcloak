import cookie from 'cookie'
import fetch from 'node-fetch'
import ErrorCodes from '../../core/fullstack/ErrorCodes'
import MiscTools from '../../core/backend/MiscTools'


export default async (req, res) => {
  const returnPayload = {
    data: null,
    error: null,
  }

  const allCookies = cookie.parse(req.headers.cookie)

  // the refresh token is not present in the cookies so a payload with an error message is returned
  if (!('refresh_token' in allCookies)) {
    console.log('💥 No refresh token in the cookies, impossible to get an access token')
    returnPayload.error = {
      message: 'Refresh token is missing',
      code: ErrorCodes.MISSING_REFRESH_TOKEN
    }
    res.statusCode = 401
    return res.json(returnPayload)
  }

  // checking if the refresh token is still valid
  const refreshToken = allCookies.refresh_token
  const refreshTokenDecoded = MiscTools.decodeJWT(refreshToken)
  const isExpired = refreshTokenDecoded.data.exp < (~~Date.now() / 1000)

  // the token is no longer valid so a payload with an error message is returned
  if (isExpired) {
    console.log('🍪💀 The refresh token in the cookies is expired')
    returnPayload.error = {
      message: 'Refresh token is expired',
      code: ErrorCodes.EXPIRED_REFRESH_TOKEN
    }
    res.statusCode = 401
    return res.json(returnPayload)
  }

  // the refresh token is still valid, a new access token can be fetched along with a new refresh token
  const url = `${process.env.NEXT_PUBLIC_AUTH_SERVER}/auth/realms/${process.env.NEXT_PUBLIC_AUTH_REALM}/protocol/openid-connect/token`
  const newTokensRes = await fetch(url, {
    body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}&client_secret=${encodeURIComponent(process.env.CLIENT_SECRET)}&client_id=${encodeURIComponent(process.env.NEXT_PUBLIC_CLIENT_ID)}`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    method: "POST",
  })

  const newTokensData = await newTokensRes.json()

  // If there was a Keycloak error, then a error payload is returned
  if ('error' in newTokensData && newTokensData.error) {
    console.log('💥🔑 Keycloak returned an error when refresh')
    returnPayload.error = {
      message: newTokensData.error,
      code: ErrorCodes.KEYCLOAK_REFRESH_ERROR
    }
    res.statusCode = 500
    return res.json(returnPayload)
  }

  // if things are going well, we update the refresh token in the cookie
  res.setHeader(
    'Set-Cookie',
    cookie.serialize('refresh_token', String(newTokensData.refresh_token), {
      maxAge: 60 * 60 * 24 * 365, // a year
      httpOnly: true,
      secure: !!process.env.PRODUCTION
    }
  ))

  // put the access token in the returned payload
  returnPayload.data = {
    access_token: newTokensData.access_token
  }

  res.statusCode = 200
  res.json(returnPayload)
}
