import mockFetch from './mockFetch'
import '@testing-library/jest-dom'

global.fetch = mockFetch
