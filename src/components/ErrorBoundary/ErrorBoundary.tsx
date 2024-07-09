import React, { ErrorInfo, Component } from 'react'
import { LayerContext } from '../../contexts/LayerContext'
import { ErrorBoundaryMessage } from './ErrorBoundaryMessage'

interface ErrorBoundaryProps {
  onError?: (error: Error) => void
}

interface ErrorBoundaryState {
  hasError?: boolean
}

export class ErrorBoundary extends Component<
  React.PropsWithChildren<ErrorBoundaryProps>,
  ErrorBoundaryState
> {
  static contextType = LayerContext

  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_error: Error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    if (this.props.onError) {
      this.props.onError(error)
    } else if ((this.context as { onError?: (e: Error) => void }).onError) {
      const context = this.context as { onError: (e: Error) => void }
      context.onError(error)
    }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorBoundaryMessage />
    }
    return (this.props as { children: any }).children
  }
}
