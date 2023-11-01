import React from 'react'
import { Hello } from './Hello'
import '@testing-library/jest-dom'
import { render } from '@testing-library/react'

global.fetch = jest.fn(() =>
  Promise.resolve({ json: () => Promise.resolve({ name: 'Billy Someone' }) }),
)

it('renders Hello', async () => {
  const { findByText } = render(<Hello />)
  const hello = await findByText('Billy Someone', { exact: false })
  expect(hello).toBeInTheDocument()
})
