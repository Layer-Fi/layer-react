import { describe, expect, it, vi } from 'vitest'
import { SWRConfig } from 'swr'
import { fireEvent, render, waitFor, within } from '@testing-library/react'

import type { UserVisibleTask } from '@utils/bookkeeping/tasks/bookkeepingTasksFilters'
import { TasksListItem } from '@components/Tasks/TasksListItem'

/**
 * Reproduction for the duplicate-submission half of the bug: a task could be
 * submitted more than once if its submit button was clicked again before the
 * in-flight request settled.
 *
 * The fix wires the submit hook's `isMutating` flag into the submit button's
 * `disabled` state. While a submission is in flight the button is disabled, so a
 * second click is a no-op.
 *
 * This renders a real TasksListItem backed by the real submit hook, with the
 * network call held open, clicks submit, waits for the button to disable, then
 * clicks again and asserts the request fired only once.
 *
 *   - Buggy code (no isMutating guard): second click fires a 2nd request -> FAILS
 *   - Fixed code (disabled while mutating): only one request fires        -> PASSES
 */

// Hold the request open so `isMutating` stays true, and count invocations.
const { submitFetcher } = vi.hoisted(() => ({
  submitFetcher: vi.fn(() => new Promise(() => {})),
}))

vi.mock('@utils/api/authenticatedHttp', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@utils/api/authenticatedHttp')>()
  return {
    ...actual,
    post: () => submitFetcher,
    postWithFormData: () => submitFetcher,
  }
})

vi.mock('@hooks/utils/auth/useAuth', () => ({
  useAuth: () => ({ data: { access_token: 'test-token', apiUrl: 'https://api.test' } }),
}))

vi.mock('@contexts/LayerContext/LayerContext', () => ({
  useLayerContext: () => ({ businessId: 'business-1' }),
}))

vi.mock('@utils/swr/localeKeyMiddleware', () => ({
  useLocalizedKey: () => <T,>(key: T) => key,
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (_key: string, fallback?: string) => fallback ?? _key }),
}))

function makeTask(overrides: Partial<UserVisibleTask> & { id: string }): UserVisibleTask {
  return {
    question: `Question for ${overrides.id}`,
    title: `Title for ${overrides.id}`,
    status: 'TODO',
    transaction_id: null,
    type: 'GENERIC',
    user_marked_completed_at: null,
    user_response: null,
    user_response_type: 'FREE_RESPONSE',
    archived_at: null,
    completed_at: null,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    effective_date: '2026-01-01',
    documents: [],
    ...overrides,
  } as UserVisibleTask
}

describe('TasksListItem submission guard', () => {
  it('submits a task at most once while a request is in flight', async () => {
    const { container } = render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <TasksListItem task={makeTask({ id: 'task-A' })} defaultOpen />
      </SWRConfig>,
    )

    const textarea = within(container).getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'My answer' } })

    const submitButton = within(container).getByRole('button', { name: 'Save' })

    // First submission kicks off the request.
    fireEvent.click(submitButton)
    expect(submitFetcher).toHaveBeenCalledTimes(1)

    // While in flight, the button must become disabled.
    await waitFor(() => expect(submitButton).toBeDisabled())

    // A second click during the in-flight request must NOT fire another request.
    fireEvent.click(submitButton)
    expect(submitFetcher).toHaveBeenCalledTimes(1)
  })
})
