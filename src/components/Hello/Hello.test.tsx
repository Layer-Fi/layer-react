import React from 'react'
import { Hello } from './Hello'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

global.fetch = jest.fn(() =>
  Promise.resolve({ json: () => Promise.resolve({ name: 'Billy Someone' }) }),
)

it('renders Hello', async () => {
  render(<Hello />)
  const hello = await screen.findByText('Billy Someone', { exact: false })
  expect(hello).toBeInTheDocument()
})
