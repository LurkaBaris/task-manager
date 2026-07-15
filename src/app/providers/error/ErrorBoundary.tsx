import { ErrorPage } from '@/pages/error'
import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return {
      hasError: true,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application error:', error)
    console.error(errorInfo)
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
    })
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return <ErrorPage onRetry={this.handleReset} />
  }
}
