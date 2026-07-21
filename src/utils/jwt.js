export function decodeJwtPayload(token) {
  const payload = token.split('.')[1]
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(atob(base64))
}

export function isTokenExpired(token) {
  try {
    const { exp } = decodeJwtPayload(token)
    if (!exp) return false
    return Date.now() >= exp * 1000
  } catch {
    return true
  }
}
