import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { type FormSearchComboBoxFieldProps, type SearchComboBoxSelection } from '@blocks/Form/FormSearchComboBoxField'
import { useAppForm } from '@blocks/Form/useForm'

import { LayerTestProvider } from '@testUtils/render/LayerTestProvider'

const OPTIONS = [{ value: 'vendor-1', label: 'Acme Supplies' }]

const DEFAULT_VALUES: { selection: SearchComboBoxSelection | null } = { selection: null }

type HarnessProps = Partial<Omit<FormSearchComboBoxFieldProps, 'label'>>

const Harness = ({ options = OPTIONS, onSearchQueryChange = () => {}, ...props }: HarnessProps) => {
  const form = useAppForm({ defaultValues: DEFAULT_VALUES })

  return (
    <form.AppField name='selection'>
      {field => <field.FormSearchComboBoxField label='Vendor' options={options} onSearchQueryChange={onSearchQueryChange} {...props} />}
    </form.AppField>
  )
}

const renderSearchField = (props: HarnessProps = {}) => ({
  user: userEvent.setup(),
  ...render(<Harness {...props} />, { wrapper: LayerTestProvider }),
})

describe('FormSearchComboBoxField', () => {
  it('reports the typed query and selects a result', async () => {
    const onSearchQueryChange = vi.fn<(query: string) => void>()
    const onSelect = vi.fn()
    const { user } = renderSearchField({ onSearchQueryChange, onSelect })

    await user.type(screen.getByRole('combobox', { name: 'Vendor' }), 'Acme')
    await user.click(await screen.findByRole('option', { name: 'Acme Supplies' }))

    expect(onSearchQueryChange.mock.calls.map(([query]) => query)).toContain('Acme')
    expect(onSelect).toHaveBeenCalledWith({ value: 'vendor-1', label: 'Acme Supplies' })
    expect(screen.getByText('Acme Supplies')).toBeInTheDocument()
  })

  it('keeps typed text as a created answer when creating is allowed', async () => {
    const onSelect = vi.fn()
    const { user } = renderSearchField({
      options: [],
      allowCreate: true,
      formatCreateLabel: text => `Use “${text}”`,
      onSelect,
    })

    await user.type(screen.getByRole('combobox', { name: 'Vendor' }), 'Corner shop')
    await user.click(await screen.findByRole('option', { name: 'Use “Corner shop”' }))

    expect(onSelect).toHaveBeenCalledWith({ value: 'Corner shop', label: 'Corner shop', isCreated: true })
  })

  it('offers no created answer when a result already matches the typed text', async () => {
    const { user } = renderSearchField({
      allowCreate: true,
      formatCreateLabel: text => `Use “${text}”`,
    })

    await user.type(screen.getByRole('combobox', { name: 'Vendor' }), 'acme supplies')

    expect(await screen.findByRole('option', { name: 'Acme Supplies' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Use “acme supplies”' })).not.toBeInTheDocument()
  })

  it('offers no created answer while results are loading', async () => {
    const { user } = renderSearchField({
      options: [],
      allowCreate: true,
      isLoading: true,
      formatCreateLabel: text => `Use “${text}”`,
    })

    await user.type(screen.getByRole('combobox', { name: 'Vendor' }), 'Corner shop')

    expect(screen.queryByRole('option', { name: 'Use “Corner shop”' })).not.toBeInTheDocument()
  })
})
