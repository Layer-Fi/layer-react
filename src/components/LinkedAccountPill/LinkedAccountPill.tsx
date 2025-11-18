import { useState } from 'react'
import { MenuTrigger, Popover } from 'react-aria-components'

import AlertCircle from '@icons/AlertCircle'
import { Menu, MenuItem } from '@ui/Menu/Menu'
import { Pill } from '@ui/Pill/Pill'
import { Span } from '@ui/Typography/Text'

type LinkedAccountPillProps = {
  label: string
  items: ReadonlyArray<{
    action: () => void
    name: string
  }>
}

export function LinkedAccountPill({ label, items }: LinkedAccountPillProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <MenuTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
      <Pill
        status='error'
        onPress={() => setIsOpen(true)}
      >
        <AlertCircle size={14} />
        {label}
      </Pill>
      <Popover
        className='Layer__Portal'
        placement='bottom end'
      >
        <Menu>
          {items.map(({ action, name }, index) => (
            <MenuItem
              key={index}
              onAction={action}
              textValue={name}
            >
              <Span slot='label' size='sm'>
                {name}
              </Span>
            </MenuItem>
          ))}
        </Menu>
      </Popover>
    </MenuTrigger>
  )
}
