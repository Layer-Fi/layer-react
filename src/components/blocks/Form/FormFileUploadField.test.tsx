import { screen, waitFor } from '@testing-library/react'
import type userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { FormFileUploadField, type FormFileUploadFieldProps, type UploadedFile } from '@blocks/Form/FormFileUploadField'

import { renderFormField } from '@testUtils/render/renderFormField'

const toUploaded = (files: ReadonlyArray<File>) => Promise.resolve(files.map(({ name }) => ({ id: `id-${name}`, name })))

type UploadFieldProps = Partial<Omit<FormFileUploadFieldProps, 'label'>> & { initialFiles?: UploadedFile[] }

// A user can pick any file through the picker's "All files" option, so the `accept` hint is not applied.
const renderUploadField = ({ initialFiles = [], ...props }: UploadFieldProps = {}) =>
  renderFormField(
    <FormFileUploadField label='Receipts' accept={[]} upload={toUploaded} {...props} />,
    { defaultValue: initialFiles, userOptions: { applyAccept: false } },
  )

const selectFiles = async (user: ReturnType<typeof userEvent.setup>, container: HTMLElement, ...names: string[]) => {
  const fileInput = container.querySelector<HTMLInputElement>('input[type="file"]')
  if (!fileInput) throw new Error('No file input rendered')

  await user.upload(fileInput, names.map(name => new File(['content'], name)))
}

describe('FormFileUploadField', () => {
  it('lists every uploaded file and offers to add more', async () => {
    const { user, container } = renderUploadField({ multiple: true })

    await selectFiles(user, container, 'one.pdf', 'two.pdf')

    expect(await screen.findByText('one.pdf')).toBeInTheDocument()
    expect(screen.getByText('two.pdf')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add more files' })).toBeInTheDocument()
  })

  it('replaces the file when only one is allowed', async () => {
    const { user, container } = renderUploadField({ initialFiles: [{ id: 'old', name: 'old.pdf' }] })

    expect(screen.getByRole('button', { name: 'Replace file' })).toBeInTheDocument()

    await selectFiles(user, container, 'new.pdf')

    expect(await screen.findByText('new.pdf')).toBeInTheDocument()
    expect(screen.queryByText('old.pdf')).not.toBeInTheDocument()
  })

  it('names the accepted types and skips the upload for a rejected file', async () => {
    const upload = vi.fn(toUploaded)
    const { user, container } = renderUploadField({ accept: ['pdf', 'png'], upload, multiple: true })

    await selectFiles(user, container, 'notes.txt')

    expect(await screen.findByText(/Upload a PDF or PNG file instead/)).toBeInTheDocument()
    expect(upload).not.toHaveBeenCalled()
  })

  it('says so when the upload fails', async () => {
    const { user, container } = renderUploadField({ upload: () => Promise.resolve(null) })

    await selectFiles(user, container, 'receipt.pdf')

    expect(await screen.findByText('Some files couldn’t be uploaded. Try again.')).toBeInTheDocument()
    expect(screen.queryByText('receipt.pdf')).not.toBeInTheDocument()
  })

  it('removes a file', async () => {
    const { user } = renderUploadField({ initialFiles: [{ id: 'a', name: 'a.pdf' }, { id: 'b', name: 'b.pdf' }], multiple: true })

    await user.click(screen.getAllByRole('button', { name: 'Remove' })[0]!)

    await waitFor(() => expect(screen.queryByText('a.pdf')).not.toBeInTheDocument())
    expect(screen.getByText('b.pdf')).toBeInTheDocument()
  })
})
