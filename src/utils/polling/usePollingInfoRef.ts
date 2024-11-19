import { useRef } from 'react'

class DeferredPromise<T> {

  readonly promise: Promise<T>
  private internalResolve: (value: T | PromiseLike<T>) => void
  private internalReject: (reason: unknown) => void

  constructor() {
    this.internalResolve = () => {}
    this.internalReject = () => {}

    this.promise = new Promise<T>((resolve, reject) => {
      this.internalResolve = resolve
      this.internalReject = reject
    })
  }

  resolve(value: T | PromiseLike<T>) {
    this.internalResolve(value)
  }

  reject(reason: unknown) {
    this.internalReject(reason)
  }
}

type PollingInfoOptions = {
  maxAttempts: number
  pollingIntervalMs: number
}

class PollingInfo {

  private maxAttempts: number
  readonly pollingIntervalMs: number

  private enabled = false
  private attempt = 0

  private deferredPromise?: DeferredPromise<void>

  constructor({
    maxAttempts,
    pollingIntervalMs
  }: PollingInfoOptions) {
    this.maxAttempts = maxAttempts
    this.pollingIntervalMs = pollingIntervalMs
  }

  isEnabled() {
    return this.enabled
  }

  enable() {
    this.enabled = true

    this.deferredPromise = this.deferredPromise ?? new DeferredPromise<void>()
    return this.deferredPromise.promise
  }

  incrementOrReset() {
    if (this.enabled) {
      this.attempt += 1
    }

    if (this.attempt >= this.maxAttempts) {
      this.reset()
    }
  }

  reset() {
    this.enabled = false
    this.attempt = 0

    this.deferredPromise?.resolve()
    this.deferredPromise = undefined
  }
}

export function usePollingInfoRef({
  maxAttempts,
  pollingIntervalMs
}: PollingInfoOptions) {
  return useRef(new PollingInfo({ maxAttempts, pollingIntervalMs }))
}
