import atob from 'atob'

export default class MiscTools {
  /**
   * Decode a JWT fron Node js (where native atob does not exist)
   */
  static decodeJWT(jwt) {
    const tokenDataArray = jwt.split('.').slice(0, 2).map((b64) => JSON.parse(atob(b64)))
    return {
      header: tokenDataArray[0],
      data: tokenDataArray[1]
    }
  }
}