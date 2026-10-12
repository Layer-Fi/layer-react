import { type ComponentProps } from 'react'

import { Tasks as TasksContent } from '@features/bookkeeping/Tasks/Tasks'
import { ConnectAccountProvider } from '@features/linkedAccounts/ConnectAccountProvider/ConnectAccountProvider'

export const Tasks = (props: ComponentProps<typeof TasksContent>) => (
  <ConnectAccountProvider>
    <TasksContent {...props} />
  </ConnectAccountProvider>
)
