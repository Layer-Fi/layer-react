export interface ToastData {
  id?: string
  content: string
  duration?: number
  isExiting?: boolean
  type?: 'success' | 'error' | 'default'
}
