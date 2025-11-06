import { APIError } from '@models/APIError'

type LayerErrorType = 'unauthenticated' | 'api' | 'render'
type LayerErrorScope = 'BankTransaction' | 'ChartOfAccounts'

export interface LayerError {
  type?: LayerErrorType
  scope?: LayerErrorScope
  payload: Error | APIError
}

class ErrorHandlerClass {
  public onErrorCallback?: (err: LayerError) => void | undefined

  constructor() {
    this.onErrorCallback = undefined
  }

  public setOnError(errorFnc: ((err: LayerError) => void) | undefined) {
    this.onErrorCallback = errorFnc
  }

  public onError(err: LayerError) {
    if (this.onErrorCallback) {
      this.onErrorCallback(err)
    }
  }
}

export const errorHandler = new ErrorHandlerClass()

export const reportError = (payload: LayerError) =>
  errorHandler.onError(payload)
