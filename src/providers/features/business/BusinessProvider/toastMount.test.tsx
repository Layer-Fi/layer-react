import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { useLayerContext } from '@providers/global/LayerContext/LayerContext'

import { LayerTestProvider } from '@testUtils/render/LayerTestProvider'

function ToastTrigger() {
  const { addToast } = useLayerContext()
  return <button onClick={() => addToast({ content: 'Saved' })}>emit</button>
}

describe('toast mounting', () => {
  it('renders a toast emitted through LayerContext', async () => {
    render(<ToastTrigger />, { wrapper: LayerTestProvider })
    await userEvent.click(screen.getByRole('button', { name: 'emit' }))
    expect(await screen.findByText('Saved')).toBeInTheDocument()
  })
})
