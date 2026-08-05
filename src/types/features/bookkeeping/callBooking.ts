// String-override contract for the call-booking surface, kept in foundation so
// the hook that drives it does not depend on the component.

export interface CallBookingStringOverrides {
  title?: string
  description?: string
  coverage?: string
}
