export class ConflictError extends Error {
  constructor(message = 'Conflicto con el recurso') {
    super(message)

    this.name = 'ConflictError'
    this.status = 409
  }
}
