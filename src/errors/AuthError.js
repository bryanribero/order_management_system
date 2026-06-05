export class AuthError extends Error {
  constructor(message = 'Credenciales inválidas') {
    super(message)

    this.name = 'AuthError'
    this.status = 401
  }
}
