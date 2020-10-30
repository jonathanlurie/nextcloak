import Head from 'next/head'
import { Form, Input, Button, Checkbox } from 'antd'
import styles from '../styles/Home.module.css'
import TokenLogic from '../core/frontend/TokenLogic'
import TokenStatus from '../components/TokenStatus'


async function onClickRefreshToken() {
  const tokenData = await TokenLogic.refreshToken()
  console.log(tokenData)
}


export default function Home() {
  return (
    <div>
      <div>
        <a
          href={TokenLogic.getKeycloakLoginLink()}
        >
          login with Keycloak
        </a>
      </div>

      <Button onClick={onClickRefreshToken}>
        Refresh token
      </Button>

      <TokenStatus/>
    </div>
  )
}


