import { type MutableRefObject } from 'react'

export enum PollingPhase {
  /**
   * Not polling. Entered whenever `shouldContinue` is false (a natural pause).
   * The next time `shouldContinue` is true, a fresh session starts.
   */
  Idle = 'idle',
  /** Actively polling on the configured interval. */
  Active = 'active',
  /**
   * Halted by the max-duration deadline, the error-retry max count, or a fatal error,
   * while `shouldContinue` still wants to continue. No restart until `shouldContinue`
   * goes false, returning the phase to `Idle`.
   */
  Stopped = 'stopped',
}

export type PollingPhaseRef = MutableRefObject<PollingPhase>

export const isIdle = (phaseRef: PollingPhaseRef) => phaseRef.current === PollingPhase.Idle
export const isActive = (phaseRef: PollingPhaseRef) => phaseRef.current === PollingPhase.Active
export const isStopped = (phaseRef: PollingPhaseRef) => phaseRef.current === PollingPhase.Stopped
