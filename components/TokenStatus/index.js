import React from 'react'
import TokenLogic from '../../core/frontend/TokenLogic'


export default class TokenStatus extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      remainingSeconds: 0,
      hasToken: false,
    }
    
    setInterval(() => {
      
      this.setState({
        hasToken: TokenLogic.hasToken(),
        remainingSeconds: TokenLogic.getTokenRemainingValidity(),
      })
    }, 1000)
  }


  render() {
    return (
      <div
        style={{
          padding: 20,
          border: '1px grey solid',
          margin: 20
        }}
      >
        <p>
          Has a token: {this.state.hasToken ? 'yes' : 'nope'}
        </p>

        <p>
          Remaining seconds: {this.state.remainingSeconds}
        </p>

      </div>
    )
  }
}