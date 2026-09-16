import { type MutableRefObject } from 'react'

export enum PollingPhase {
  /**
   * Not polling because `shouldContinue` is false (a natural pause, or the initial
   * state). Restarts as soon as `shouldContinue` is true again — at mount via
   * `refreshInterval`, or once the loop has died via `onSuccess`.
   */
  Idle = 'idle',
  /** Actively polling on the configured interval. */
  Active = 'active',
  /**
   * Halted by the max-duration/error cap while `shouldContinue` was still true. Stays
   * here until a poll reports fresh progress (`shouldRestartPolling`, defaulting to a
   * `shouldContinue` rising edge); a session that merely still wants to continue does
   * not revive it, so the cap holds for a genuinely stuck poll.
   */
  Stopped = 'stopped',
}

export type PollingPhaseRef = MutableRefObject<PollingPhase>

export const isIdle = (phaseRef: PollingPhaseRef) => phaseRef.current === PollingPhase.Idle
export const isActive = (phaseRef: PollingPhaseRef) => phaseRef.current === PollingPhase.Active
export const isStopped = (phaseRef: PollingPhaseRef) => phaseRef.current === PollingPhase.Stopped
