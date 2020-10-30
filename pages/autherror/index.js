import React from 'react'

export default class AuthError extends React.Component {
  constructor(props) {
    super(props)

    this.state = {}
  }

  render() {
    return (
      <div>
        Something went wrong with the auth :(
      </div>
    )
  }
}