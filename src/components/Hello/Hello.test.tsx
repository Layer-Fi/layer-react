import React from 'react'
import { Hello } from './Hello'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

it('renders Hello', async () => {
  global.fetch.mockResolvedValue({
    json: () => Promise.resolve({ name: 'Billy Someone' }),
  })
  render(<Hello />)
  const hello = await screen.findByText('Billy Someone', { exact: false })
  expect(hello).toBeInTheDocument()
})
