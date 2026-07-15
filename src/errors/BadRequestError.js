export class BadRequestError extends Error {
  constructor(message = 'Solicitud incorrecta') {
    super(message)

    this.name = 'BadRequestError'
    this.status = 400
  }
}
