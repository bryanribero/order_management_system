export class NotFoundError extends Error {
  constructor(message = 'Elemento no encontrado') {
    super(message)

    this.name = 'NotFoundError'
    this.status = 404
  }
}
