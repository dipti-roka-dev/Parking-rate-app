import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('Parking Rate Calculator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it('renders the main title and form fields', () => {
    render(<App />)

    expect(screen.getByText('Parking Rate Calculator')).toBeInTheDocument()
    expect(screen.getByLabelText(/Entry Date & Time/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Exit Date & Time/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Vehicle Type/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Calculate Fee/i })).toBeInTheDocument()
  })

  it('shows error when entry or exit time is missing', async () => {
    render(<App />)

    await userEvent.click(screen.getByRole('button', { name: /Calculate Fee/i }))

    expect(
      await screen.findByText('Please select valid entry and exit date/time.')
    ).toBeInTheDocument()
  })

  it('shows error when exit is before entry', async () => {
    render(<App />)

    const entryInput = screen.getByLabelText(/Entry Date & Time/i)
    const exitInput = screen.getByLabelText(/Exit Date & Time/i)

    await userEvent.type(entryInput, '2025-03-25T10:00')
    await userEvent.type(exitInput, '2025-03-25T09:00')

    await userEvent.click(screen.getByRole('button', { name: /Calculate Fee/i }))

    expect(
      await screen.findByText('Exit time must be after entry time.')
    ).toBeInTheDocument()
  })

  it('shows error when duration exceeds 3 days', async () => {
    render(<App />)

    const entryInput = screen.getByLabelText(/Entry Date & Time/i)
    const exitInput = screen.getByLabelText(/Exit Date & Time/i)

    await userEvent.type(entryInput, '2025-03-20T10:00')
    await userEvent.type(exitInput, '2025-03-24T10:01')

    await userEvent.click(screen.getByRole('button', { name: /Calculate Fee/i }))

    expect(
      await screen.findByText(
        'Maximum parking duration is 3 days (72 hours). Please adjust your times.'
      )
    ).toBeInTheDocument()
  })

  it('calculates correctly: 20 minutes → $0 (free)', async () => {
    render(<App />)

    await userEvent.type(screen.getByLabelText(/Entry Date & Time/i), '2025-03-25T10:00')
    await userEvent.type(screen.getByLabelText(/Exit Date & Time/i), '2025-03-25T10:20')

    await userEvent.click(screen.getByRole('button', { name: /Calculate Fee/i }))

    expect(await screen.findByText(/Duration: 0h 20m/)).toBeInTheDocument()
    expect(await screen.findByTestId('result-fee')).toHaveTextContent('$0.00')
  })

  it('calculates correctly: 45 minutes → $2 (first block after free 30 min)', async () => {
    render(<App />)

    await userEvent.type(screen.getByLabelText(/Entry Date & Time/i), '2025-03-25T10:00')
    await userEvent.type(screen.getByLabelText(/Exit Date & Time/i), '2025-03-25T10:45')

    await userEvent.click(screen.getByRole('button', { name: /Calculate Fee/i }))

    expect(await screen.findByTestId('result-duration')).toHaveTextContent('0h 45m')
    expect(await screen.findByTestId('result-fee')).toHaveTextContent('$2.00')
  })

  it('applies weekend +20% surcharge on Saturday', async () => {
    render(<App />)

    await userEvent.type(screen.getByLabelText(/Entry Date & Time/i), '2025-03-29T10:00') // Saturday
    await userEvent.type(screen.getByLabelText(/Exit Date & Time/i), '2025-03-29T11:30')

    await userEvent.click(screen.getByRole('button', { name: /Calculate Fee/i }))

    expect(await screen.findByTestId('result-fee')).toHaveTextContent('$4.80')
    expect(await screen.findByTestId('weekend-tag')).toHaveTextContent('Weekend rate (+20%)')
  })

  it('applies motorcycle multiplier 0.6', async () => {
    render(<App />)

    await userEvent.type(screen.getByLabelText(/Entry Date & Time/i), '2025-03-25T10:00')
    await userEvent.type(screen.getByLabelText(/Exit Date & Time/i), '2025-03-25T12:00')
    await userEvent.selectOptions(screen.getByLabelText(/Vehicle Type/i), 'motorcycle')

    await userEvent.click(screen.getByRole('button', { name: /Calculate Fee/i }))

    expect(await screen.findByTestId('result-fee')).toHaveTextContent('$3.60')
  })

  it('respects daily cap $25 (before multiplier)', async () => {
    render(<App />)

    await userEvent.type(screen.getByLabelText(/Entry Date & Time/i), '2025-03-25T10:00')
    await userEvent.type(screen.getByLabelText(/Exit Date & Time/i), '2025-03-25T23:00')

    await userEvent.click(screen.getByRole('button', { name: /Calculate Fee/i }))

    expect(await screen.findByTestId('result-fee')).toHaveTextContent('$25.00')
  })

  it('saves calculation to history and shows it', async () => {
    render(<App />)

    const entryInput = screen.getByLabelText(/Entry Date & Time/i)
    const exitInput = screen.getByLabelText(/Exit Date & Time/i)
    const vehicleSelect = screen.getByLabelText(/Vehicle Type/i)

    await userEvent.clear(entryInput)
    await userEvent.type(entryInput, '2025-03-25T10:00')

    await userEvent.clear(exitInput)
    await userEvent.type(exitInput, '2025-03-25T10:45')

    await userEvent.selectOptions(vehicleSelect, 'car')

    const calcBtn = screen.getByRole('button', { name: /Calculate Fee/i })
    await userEvent.click(calcBtn)

    await waitFor(() => {
      // Result section
      const resultFee = screen.getByTestId('result-fee')
      const resultDuration = screen.getByTestId('result-duration')
      expect(resultFee).toHaveTextContent('$2.00')
      expect(resultDuration).toHaveTextContent('0h 45m')

      // History section
      const historyFee = screen.getByTestId('history-fee')
      expect(historyFee).toHaveTextContent('$2.00')

      expect(screen.getByText(/Recent Calculations/i)).toBeInTheDocument()
      expect(
        screen.getByText(/3\/25\/2025, 10:00:00 AM.*10:45:00 AM/)
      ).toBeInTheDocument()
    })
  })
})