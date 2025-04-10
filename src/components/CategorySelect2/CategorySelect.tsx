import { Button, Menu, MenuTrigger, MenuItem, Popover, SubmenuTrigger } from 'react-aria-components'
import { Input } from '../Input/Input'
import { useState } from 'react'

export const CategorySelect = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className='Layer__category-select'>
      <MenuTrigger isOpen={isOpen} onOpenChange={() => setIsOpen(true)}>
        <Button aria-label='Menu'>Selected</Button>
        <Popover className='Layer__category-select__popover'>
          <Menu>
            <MenuItem onAction={() => {}}>
              <Input placeholder='Search category' />
            </MenuItem>
            <MenuItem>Match</MenuItem>
            <MenuItem>Suggestions</MenuItem>
            <MenuItem>Account type</MenuItem>
            <MenuItem>Split</MenuItem>
            <SubmenuTrigger>
              <MenuItem>Add new cateogry</MenuItem>
              <Popover>
                <Menu>
                  <MenuItem>
                    <p>Add new category</p>
                    <label>Parent category</label>
                    <Input placeholder='Select parent' />
                    <label>Category name</label>
                    <Input placeholder='Enter category name' />
                    <Button>Add</Button>
                  </MenuItem>
                </Menu>
              </Popover>
            </SubmenuTrigger>
          </Menu>
        </Popover>
      </MenuTrigger>
    </div>
  )
}
