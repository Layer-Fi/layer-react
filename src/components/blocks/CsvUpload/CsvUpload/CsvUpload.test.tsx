import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { CsvUpload } from '@blocks/CsvUpload/CsvUpload/CsvUpload'

import { LayerTestProvider } from '@testUtils/render/LayerTestProvider'

const dropFiles = (target: HTMLElement, ...files: File[]) =>
  fireEvent.drop(target, { dataTransfer: { files, items: files.map(file => ({ kind: 'file', getAsFile: () => file })), types: ['Files'] } })

describe('CsvUpload', () => {
  it('keeps the chosen file when a replacement drop is rejected', async () => {
    const chosen = new File(['a,b\n'], 'transactions.csv', { type: 'text/csv' })
    const onFileSelected = vi.fn()
    render(<LayerTestProvider><CsvUpload file={chosen} onFileSelected={onFileSelected} /></LayerTestProvider>)

    dropFiles(screen.getByText('transactions.csv'), new File(['x'], 'notes.txt', { type: 'text/plain' }))

    expect(await screen.findByText('File extension must end in .csv')).toBeInTheDocument()
    expect(onFileSelected).not.toHaveBeenCalled()
    expect(screen.getByText('transactions.csv')).toBeInTheDocument()
  })
})
