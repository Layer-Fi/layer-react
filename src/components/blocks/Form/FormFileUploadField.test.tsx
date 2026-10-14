import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import type userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { FormFileUploadField, type FormFileUploadFieldProps } from '@blocks/Form/FormFileUploadField'
import { type UploadedFile } from '@blocks/Form/types'

import { renderFormField } from '@testUtils/render/renderFormField'

const toUploaded = (files: ReadonlyArray<File>) => Promise.resolve(files.map(({ name }) => ({ id: `id-${name}`, name })))

type UploadFieldProps = Partial<Omit<FormFileUploadFieldProps, 'label'>> & { initialFiles?: UploadedFile[] }

// A user can pick any file through the picker's "All files" option, so the `accept` hint is not applied.
const renderUploadField = ({ initialFiles = [], ...props }: UploadFieldProps = {}) =>
  renderFormField(
    <FormFileUploadField label='Receipts' accept={[]} upload={toUploaded} {...props} />,
    { defaultValue: initialFiles, userOptions: { applyAccept: false } },
  )

const selectFiles = async (user: ReturnType<typeof userEvent.setup>, container: HTMLElement, ...files: Array<string | File>) => {
  const fileInput = container.querySelector<HTMLInputElement>('input[type="file"]')
  if (!fileInput) throw new Error('No file input rendered')

  await user.upload(fileInput, files.map(file => (typeof file === 'string' ? new File(['content'], file) : file)))
}

const expectListed = (...names: string[]) => waitFor(() => {
  expect(screen.queryByText('Uploading…')).not.toBeInTheDocument()
  names.forEach(name => expect(screen.getByRole('button', { name: `Remove ${name}` })).toBeInTheDocument())
})

const dropFiles = (...names: string[]) => {
  const files = names.map(name => new File(['content'], name))
  return fireEvent.drop(screen.getByText(/^Drag .* here$/), { dataTransfer: { files, items: files.map(file => ({ kind: 'file', getAsFile: () => file })), types: ['Files'] } })
}

const flushDrop = () => act(() => new Promise(resolve => setTimeout(resolve, 0)))

describe('FormFileUploadField', () => {
  it('lists every uploaded file in one container with the count and offers to add more', async () => {
    const { user, container } = renderUploadField({ multiple: true, maxFiles: 3 })

    await selectFiles(user, container, 'one.pdf', 'two.pdf')

    await expectListed('one.pdf', 'two.pdf')
    expect(screen.getByText(/^2 of 3 added/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add files' })).toBeInTheDocument()
  })

  it('swaps the drop area for a notice once the limit is reached', async () => {
    const { user, container } = renderUploadField({ multiple: true, maxFiles: 2 })

    await selectFiles(user, container, 'one.pdf', 'two.pdf')

    expect(await screen.findByText('2 of 2 files added. Remove one to add another.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add files' })).not.toBeInTheDocument()
  })

  it('replaces the file when only one is allowed', async () => {
    const { user, container } = renderUploadField({ initialFiles: [{ id: 'old', name: 'old.pdf' }] })

    expect(screen.getByRole('button', { name: 'Replace' })).toBeInTheDocument()

    await selectFiles(user, container, 'new.pdf')

    await expectListed('new.pdf')
    expect(screen.queryByRole('button', { name: 'Remove old.pdf' })).not.toBeInTheDocument()
  })

  it('names the accepted types and skips the upload for a rejected file', async () => {
    const upload = vi.fn(toUploaded)
    const { user, container } = renderUploadField({ accept: ['pdf', 'png'], upload, multiple: true })

    await selectFiles(user, container, 'notes.txt')

    expect(await screen.findByText(/Upload a PDF or PNG file instead/)).toBeInTheDocument()
    expect(upload).not.toHaveBeenCalled()
  })

  it('names a file over the size limit and skips its upload', async () => {
    const upload = vi.fn(toUploaded)
    const { user, container } = renderUploadField({ upload, maxFileSizeInBytes: 10 })

    await selectFiles(user, container, new File(['more than ten bytes'], 'big.pdf'))

    expect(await screen.findByText('big.pdf is 19 bytes. Files must be under 10 bytes.')).toBeInTheDocument()
    expect(upload).not.toHaveBeenCalled()
  })

  it('shows the error text it is given in place of its own', async () => {
    const { user, container } = renderUploadField({ accept: ['pdf'], errorText: 'Upload the signed lease' })

    await selectFiles(user, container, 'notes.txt')

    expect(await screen.findByText('Upload the signed lease')).toBeInTheDocument()
    expect(screen.queryByText(/Upload a PDF file instead/)).not.toBeInTheDocument()
  })

  it('says so when the upload fails', async () => {
    const { user, container } = renderUploadField({ upload: () => Promise.resolve(null) })

    await selectFiles(user, container, 'receipt.pdf')

    expect(await screen.findByText('Some files couldn’t be uploaded. Try again.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Remove receipt.pdf' })).not.toBeInTheDocument()
  })

  it('uploads files dropped onto the field, including onto a file already listed', async () => {
    renderUploadField({ accept: ['pdf'], multiple: true, maxFiles: 3, initialFiles: [{ id: 'held', name: 'held.pdf' }] })

    const files = [new File(['content'], 'one.pdf'), new File(['content'], 'two.pdf')]
    fireEvent.drop(screen.getByText('held.pdf'), { dataTransfer: { files, items: files.map(file => ({ kind: 'file', getAsFile: () => file })), types: ['Files'] } })

    await expectListed('held.pdf', 'one.pdf', 'two.pdf')
  })

  it('shows the drop state while a file is dragged over it', async () => {
    renderUploadField({ accept: ['pdf'] })

    fireEvent.dragEnter(screen.getByText('Drag and drop a file here'), { dataTransfer: { items: [{ kind: 'file', type: 'application/pdf' }], types: ['Files'] } })

    expect(await screen.findByText('Drop to upload')).toBeInTheDocument()
  })

  it('rejects a drop of several files when only one is allowed', async () => {
    const upload = vi.fn(toUploaded)
    renderUploadField({ upload })

    dropFiles('one.pdf', 'two.pdf')

    expect(await screen.findByText('Upload 1 file at a time.')).toBeInTheDocument()
    expect(upload).not.toHaveBeenCalled()
  })

  it('says how many more files fit when some are already held, until one is removed', async () => {
    const upload = vi.fn(toUploaded)
    const { user } = renderUploadField({ upload, multiple: true, maxFiles: 3, initialFiles: [{ id: 'held', name: 'held.pdf' }, { id: 'also', name: 'also.pdf' }] })

    dropFiles('one.pdf', 'two.pdf')

    expect(await screen.findByText('You can add 1 more file.')).toBeInTheDocument()
    expect(upload).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Remove held.pdf' }))

    expect(screen.queryByText('You can add 1 more file.')).not.toBeInTheDocument()
  })

  it('keeps catching drops once the limit is reached', async () => {
    const upload = vi.fn(toUploaded)
    renderUploadField({ upload, multiple: true, maxFiles: 1, initialFiles: [{ id: 'held', name: 'held.pdf' }] })

    const notice = screen.getByText('1 of 1 files added. Remove one to add another.')
    const files = [new File(['content'], 'extra.pdf')]
    const isDefaultAllowed = fireEvent.drop(notice, { dataTransfer: { files, items: files.map(file => ({ kind: 'file', getAsFile: () => file })), types: ['Files'] } })
    await flushDrop()

    expect(isDefaultAllowed).toBe(false)
    expect(upload).not.toHaveBeenCalled()
  })

  it('keeps a file listed and shows an error when removal fails', async () => {
    const remove = vi.fn(() => Promise.reject(new Error('offline')))
    const { user } = renderUploadField({ remove, multiple: true, initialFiles: [{ id: 'kept', name: 'receipt.pdf' }] })

    await user.click(screen.getByRole('button', { name: 'Remove receipt.pdf' }))

    expect(await screen.findByText('The file couldn’t be removed. Try again.')).toBeInTheDocument()
    expect(remove).toHaveBeenCalledWith({ id: 'kept', name: 'receipt.pdf' })
    expect(screen.getByRole('button', { name: 'Remove receipt.pdf' })).toBeInTheDocument()
  })

  it('drops the file once removal resolves', async () => {
    const { user } = renderUploadField({ remove: () => Promise.resolve(), multiple: true, initialFiles: [{ id: 'gone', name: 'one.pdf' }] })

    await user.click(screen.getByRole('button', { name: 'Remove one.pdf' }))

    await waitFor(() => expect(screen.queryByRole('button', { name: 'Remove one.pdf' })).not.toBeInTheDocument())
    expect(screen.queryByText('The file couldn’t be removed. Try again.')).not.toBeInTheDocument()
  })

  it('lists files without a drop area or remove action when read only', () => {
    renderUploadField({ isReadOnly: true, multiple: true, initialFiles: [{ id: 'kept', name: 'receipt.pdf' }] })

    expect(screen.getByText('receipt.pdf')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Remove receipt.pdf' })).not.toBeInTheDocument()
    expect(screen.queryByText(/^Drag .* here$/)).not.toBeInTheDocument()
  })
})
