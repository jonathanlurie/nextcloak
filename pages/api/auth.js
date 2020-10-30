import cookie from 'cookie'


export default async (req, res) => {
  const authCode = req.query.code

  const keycloakCodeExchangeUrl = `${process.env.NEXT_PUBLIC_AUTH_SERVER}/auth/realms/${encodeURIComponent(process.env.NEXT_PUBLIC_AUTH_REALM)}/protocol/openid-connect/token`

  const body = `grant_type=authorization_code&client_id=${encodeURIComponent(process.env.NEXT_PUBLIC_CLIENT_ID)}&client_secret=${encodeURIComponent(process.env.CLIENT_SECRET)}&code=${encodeURIComponent(authCode)}&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_REDIRECT_URL)}`

  // exchange code for tokens
  const tokenRes = await fetch(keycloakCodeExchangeUrl, {
    body,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: "POST",
  })

  const tokenData = await tokenRes.json()

  // if an error occured, then we redirect to an error page that will have the error
  // in url param as encoded json (yolo)
  if ('error' in tokenData && tokenData.error) {
    console.log('💥 No token data', tokenData)
    res.writeHead(302, {
      'Location': `/api/autherror?error${encodeURIComponent(JSON.stringify(tokenData))}`
    })
    return res.end()
  }

  // here, the tokens are considered valid.

  // We store the refresh token in a cookie and we dont actually do anything with the
  // access cookie because it can be very long so we dont want to redirect with it in
  // the URL (also for security reasons)

  
  res.setHeader(
    'Set-Cookie',
    cookie.serialize('refresh_token', String(tokenData.refresh_token), {
      maxAge: 60 * 60 * 24 * 365, // a year
      httpOnly: true,
      secure: !!process.env.PRODUCTION
    }
  ))

  console.log('🍪 Refresh cookie placed in secured cookie')

  res.writeHead(302, {
    'Location': '/'
  })
  res.end()
}


