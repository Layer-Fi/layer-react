import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ActionableList, type ActionableListOption } from '@blocks/ActionableList/ActionableList'

import { LayerTestProvider } from '@testUtils/render/LayerTestProvider'

const OPTIONS: ActionableListOption<string>[] = [
  { id: 'checking', label: 'Business Checking', description: 'Chase •••• 1234', value: 'checking' },
  { id: 'savings', label: 'Business Savings', description: 'Chase •••• 5678', value: 'savings' },
]

const LINK_OPTIONS: ActionableListOption<string>[] = [
  { id: 'manage', label: 'Manage connections', value: 'manage', asLink: true },
]

const SECONDARY_OPTION: ActionableListOption<string> = { id: 'other', label: 'Other account', value: 'other', secondary: true }

const renderActionableList = (props: Partial<React.ComponentProps<typeof ActionableList<string>>> = {}) => {
  const user = userEvent.setup()
  const onClick = vi.fn()

  return {
    user,
    onClick,
    ...render(
      <ActionableList options={OPTIONS} onClick={onClick} {...props} />,
      { wrapper: LayerTestProvider },
    ),
  }
}

describe('ActionableList', () => {
  it('renders an item per option with its label', () => {
    renderActionableList()

    expect(screen.getByRole('button', { name: 'Business Checking' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Business Savings' })).toBeInTheDocument()
  })

  it('does not render descriptions by default', () => {
    renderActionableList()

    expect(screen.queryByText('Chase •••• 1234')).not.toBeInTheDocument()
  })

  it('renders descriptions when showDescriptions is true', () => {
    renderActionableList({ showDescriptions: true })

    expect(screen.getByText('Chase •••• 1234')).toBeInTheDocument()
    expect(screen.getByText('Chase •••• 5678')).toBeInTheDocument()
  })

  it('calls onClick with the clicked option', async () => {
    const { user, onClick } = renderActionableList()

    await user.click(screen.getByRole('button', { name: 'Business Savings' }))

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onClick).toHaveBeenCalledWith(OPTIONS[1])
  })

  it('applies link styling only to link options', () => {
    renderActionableList({ options: [...OPTIONS, ...LINK_OPTIONS] })

    expect(screen.getByRole('button', { name: 'Manage connections' })).toHaveAttribute('data-as-link')
    expect(screen.getByRole('button', { name: 'Business Checking' })).not.toHaveAttribute('data-as-link')
  })

  it('applies secondary styling only to secondary options', () => {
    renderActionableList({ options: [...OPTIONS, SECONDARY_OPTION] })

    expect(screen.getByRole('button', { name: 'Other account' })).toHaveAttribute('data-secondary')
    expect(screen.getByRole('button', { name: 'Business Checking' })).not.toHaveAttribute('data-secondary')
  })

  it('marks the item matching selectedId as selected', () => {
    renderActionableList({ selectedId: 'checking' })

    const selectedItem = screen.getByRole('button', { name: 'Business Checking' })
    expect(selectedItem).toHaveAttribute('data-selected')

    const unselectedItem = screen.getByRole('button', { name: 'Business Savings' })
    expect(unselectedItem).not.toHaveAttribute('data-selected')
  })
})
