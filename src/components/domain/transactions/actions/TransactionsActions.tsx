import classNames from 'classnames'
import type { PropsWithChildren } from 'react'

const CLASS_NAME = 'Layer__TransactionsActions'
const UPLOAD_MENU_CLASS_NAME = `${CLASS_NAME}--with-upload-menu`

type TransactionsActionsProps = PropsWithChildren<{
  withUploadMenu?: boolean
}>
export function TransactionsActions({ children, withUploadMenu }: TransactionsActionsProps) {
  return (
    <div className={classNames(CLASS_NAME, withUploadMenu && UPLOAD_MENU_CLASS_NAME)}>
      {children}
    </div>
  )
}
