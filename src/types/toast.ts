export interface ToastProps {
  id?: string
  content: string
  duration?: number
  isExiting?: boolean
  type?: 'success' | 'error' | 'default'
}
