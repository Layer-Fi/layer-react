import { type ComponentProps } from 'react'

import { Tasks as TasksContent } from '@features/bookkeeping/Tasks/Tasks'
import { ConnectAccountProvider } from '@features/linkedAccounts/ConnectAccountProvider/ConnectAccountProvider'

/** The bookkeeping task list, able to connect accounts through Plaid when a task asks for it. */
export const Tasks = (props: ComponentProps<typeof TasksContent>) => (
  <ConnectAccountProvider>
    <TasksContent {...props} />
  </ConnectAccountProvider>
)
