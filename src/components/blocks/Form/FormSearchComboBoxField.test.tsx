import { screen } from '@testing-library/react'
import type userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { FormSearchComboBoxField, type FormSearchComboBoxFieldProps } from '@blocks/Form/FormSearchComboBoxField'

import { renderFormField } from '@testUtils/render/renderFormField'

const OPTIONS = [{ value: 'vendor-1', label: 'Acme Supplies' }]

const CREATABLE = { allowCreate: true, formatCreateLabel: (text: string) => `Use “${text}”` }

const renderSearchField = (props: Partial<Omit<FormSearchComboBoxFieldProps, 'label'>> = {}) =>
  renderFormField(
    <FormSearchComboBoxField label='Vendor' options={OPTIONS} onSearchQueryChange={() => {}} {...props} />,
    { defaultValue: null },
  )

const typeQuery = (user: ReturnType<typeof userEvent.setup>, text: string) =>
  user.type(screen.getByRole('combobox', { name: 'Vendor' }), text)

describe('FormSearchComboBoxField', () => {
  it('reports the typed query and selects a result', async () => {
    const onSearchQueryChange = vi.fn<(query: string) => void>()
    const onSelect = vi.fn()
    const { user } = renderSearchField({ onSearchQueryChange, onSelect })

    await typeQuery(user, 'Acme')
    await user.click(await screen.findByRole('option', { name: 'Acme Supplies' }))

    expect(onSearchQueryChange.mock.calls.map(([query]) => query)).toContain('Acme')
    expect(onSelect).toHaveBeenCalledWith({ value: 'vendor-1', label: 'Acme Supplies' })
    expect(screen.getByText('Acme Supplies')).toBeInTheDocument()
  })

  it('keeps typed text as a created answer when creating is allowed', async () => {
    const onSelect = vi.fn()
    const { user } = renderSearchField({ ...CREATABLE, options: [], onSelect })

    await typeQuery(user, 'Corner shop')
    await user.click(await screen.findByRole('option', { name: 'Use “Corner shop”' }))

    expect(onSelect).toHaveBeenCalledWith({ value: 'Corner shop', label: 'Corner shop', isCreated: true })
  })

  it('offers no created answer when a result already matches the typed text', async () => {
    const { user } = renderSearchField(CREATABLE)

    await typeQuery(user, 'acme supplies')

    expect(await screen.findByRole('option', { name: 'Acme Supplies' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Use “acme supplies”' })).not.toBeInTheDocument()
  })

  it('offers no created answer while results are loading', async () => {
    const { user } = renderSearchField({ ...CREATABLE, options: [], isLoading: true })

    await typeQuery(user, 'Corner shop')

    expect(screen.queryByRole('option', { name: 'Use “Corner shop”' })).not.toBeInTheDocument()
  })
})
