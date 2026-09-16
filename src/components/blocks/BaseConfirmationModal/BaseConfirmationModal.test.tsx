import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { APIError } from '@utils/shared/api/apiError'
import { BaseConfirmationModal, type BaseConfirmationModalProps } from '@blocks/BaseConfirmationModal/BaseConfirmationModal'

import { LayerTestProvider } from '@testUtils/render/LayerTestProvider'

const renderModal = (props: Partial<BaseConfirmationModalProps> = {}) => {
  const user = userEvent.setup()
  const onOpenChange = vi.fn()
  const onConfirm = vi.fn().mockResolvedValue(undefined)

  return {
    user,
    onOpenChange,
    onConfirm,
    ...render(
      <BaseConfirmationModal
        isOpen
        onOpenChange={onOpenChange}
        title='Delete this item?'
        onConfirm={onConfirm}
        {...props}
      />,
      { wrapper: LayerTestProvider },
    ),
  }
}

describe('BaseConfirmationModal', () => {
  it('renders the title, description, and content', () => {
    renderModal({ description: 'This cannot be undone.', content: <span>Extra detail</span> })

    expect(screen.getByText('Delete this item?')).toBeInTheDocument()
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument()
    expect(screen.getByText('Extra detail')).toBeInTheDocument()
  })

  it('uses default action labels when none are provided', () => {
    renderModal()

    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('uses custom action labels when provided', () => {
    renderModal({ confirmLabel: 'Delete', cancelLabel: 'Keep it' })

    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Keep it' })).toBeInTheDocument()
  })

  it('calls onConfirm and closes the modal on success', async () => {
    const { user, onConfirm, onOpenChange } = renderModal()

    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
  })

  it('keeps the modal open after a successful confirm when closeOnConfirm is false', async () => {
    const { user, onConfirm, onOpenChange } = renderModal({ closeOnConfirm: false })

    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1))
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('shows a retry state and keeps the modal open when onConfirm rejects', async () => {
    const onConfirm = vi.fn().mockRejectedValue(new APIError('Failed to delete'))
    const { user, onOpenChange } = renderModal({ onConfirm, errorText: 'Something went wrong, try again.' })

    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    expect(await screen.findByRole('button', { name: 'Retry' })).toBeInTheDocument()
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('closes the modal when cancel is clicked', async () => {
    const { user, onOpenChange, onConfirm } = renderModal()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('disables the confirm button when confirmDisabled is set', () => {
    renderModal({ confirmDisabled: true })

    expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled()
  })

  it('does not render the modal when isOpen is false', () => {
    renderModal({ isOpen: false })

    expect(screen.queryByText('Delete this item?')).not.toBeInTheDocument()
  })
})
