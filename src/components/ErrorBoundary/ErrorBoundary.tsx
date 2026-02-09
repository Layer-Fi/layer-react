import { Component, type ErrorInfo, type PropsWithChildren } from 'react'

import { type LayerError, reportError } from '@models/ErrorHandler'
import { ErrorBoundaryMessage } from '@components/ErrorBoundary/ErrorBoundaryMessage'

interface ErrorBoundaryProps {
  onError?: (error: LayerError) => void
}

interface ErrorBoundaryState {
  hasError?: boolean
}

export class ErrorBoundary extends Component<
  PropsWithChildren<ErrorBoundaryProps>,
  ErrorBoundaryState
> {
  onError?: (err: LayerError) => void

  constructor(props: PropsWithChildren<ErrorBoundaryProps>) {
    super(props)
    this.onError = props.onError
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_error: Error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  override componentDidCatch(error: Error, _info: ErrorInfo) {
    if (this.onError) {
      this.onError({ type: 'render', payload: error })
    }
    else {
      reportError({ type: 'render', payload: error })
    }
  }

  override render() {
    if (this.state.hasError) {
      return <ErrorBoundaryMessage />
    }

    return this.props.children
  }
}
