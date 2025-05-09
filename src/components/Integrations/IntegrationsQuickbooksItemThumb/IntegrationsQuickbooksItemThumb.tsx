import { useContext, useMemo } from 'react'
import QuickbooksIcon from '../../../icons/QuickbooksIcon'
import { Badge, BadgeVariant } from '../../Badge'
import { BadgeLoader } from '../../BadgeLoader'
import RefreshCcw from '../../../icons/RefreshCcw'
import { BadgeSize } from '../../Badge/Badge'
import { HStack } from '../../ui/Stack/Stack'
import { Card } from '../../Card/Card'
import { Text, TextSize } from '../../Typography'
import { QuickbooksContext } from '../../../contexts/QuickbooksContext/QuickbooksContext'
import { LinkedAccountOptions } from '../../LinkedAccountOptions/LinkedAccountOptions'
import { IntegrationsQuickbooksItemThumbFooter } from './IntegrationsQuickbooksItemThumbFooter'

export const IntegrationsQuickbooksItemThumb = () => {
  const {
    isSyncingFromQuickbooks,
    syncFromQuickbooks,
    unlinkQuickbooks,
  } = useContext(QuickbooksContext)

  const menuConfig = useMemo(() => {
    return [
      {
        name: 'Unlink account',
        action: () => {
          if (
            confirm('Please confirm you wish to disconnect from Quickbooks')
          ) {
            unlinkQuickbooks()
          }
        },
      },
    ]
  }, [unlinkQuickbooks])

  return (
    <LinkedAccountOptions config={menuConfig}>
      <Card className='Layer__linked-account-thumb Layer__integrations-quickbooks-item-thumb'>
        <div className='topbar'>
          <HStack gap='xs'>
            <Text size={TextSize.md}>Quickbooks</Text>
            {isSyncingFromQuickbooks
              ? <BadgeLoader variant={BadgeVariant.INFO} />
              : (
                <Badge
                  aria-role='button'
                  icon={<RefreshCcw size={12} />}
                  variant={BadgeVariant.INFO}
                  onClick={syncFromQuickbooks}
                  size={BadgeSize.SMALL}
                  hoverable
                >
                  Sync
                </Badge>
              )}
          </HStack>
          <div className='topbar-logo'>
            <QuickbooksIcon size={28} />
          </div>
        </div>
        <IntegrationsQuickbooksItemThumbFooter />
      </Card>
    </LinkedAccountOptions>
  )
}
