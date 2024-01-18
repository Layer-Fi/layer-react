export interface APIErrorMessage {
  type?: string
  description?: string
}

export class APIError extends Error {
  code?: number
  info?: string
  messages?: APIErrorMessage[]

  constructor(message: string, code?: number, messages?: APIErrorMessage[]) {
    super(message)
    this.name = 'APIError'
    this.code = code
    this.messages = messages

    Object.setPrototypeOf(this, APIError.prototype)
  }

  getMessage() {
    return this.message
  }

  getAllMessages() {
    return this.messages?.map(x => x.description)
  }
}
