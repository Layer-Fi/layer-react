import { type CSSProperties, useState } from 'react'
import { createPortal } from 'react-dom'

// Calendly's hosted iframe can't run in Storybook; this fakes a scheduling widget
// so CTAs that open Calendly render a believable calendar instead of a 404 iframe.

type PopupModalProps = {
  url: string
  open: boolean
  onModalClose: () => void
  rootElement: HTMLElement
}

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const TIME_SLOTS = ['9:00am', '9:30am', '10:00am', '11:00am', '1:00pm', '2:30pm', '3:00pm', '4:00pm']

const styles: Record<string, CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(15, 23, 42, 0.55)',
    zIndex: 2147483647,
  },
  card: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    width: 'min(880px, 92vw)',
    height: 'min(560px, 88vh)',
    background: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
    fontFamily: 'system-ui, sans-serif',
    color: '#0f172a',
  },
  left: { padding: 24, borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 12 },
  right: { padding: 24, display: 'grid', gridTemplateColumns: '1fr 160px', gap: 24, overflow: 'auto' },
  host: { fontSize: 13, color: '#64748b' },
  title: { fontSize: 20, fontWeight: 700, margin: 0 },
  meta: { fontSize: 14, color: '#475569', display: 'flex', alignItems: 'center', gap: 8 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, alignContent: 'start' },
  weekday: { fontSize: 11, fontWeight: 600, color: '#94a3b8', textAlign: 'center' },
  slotsCol: { display: 'flex', flexDirection: 'column', gap: 8 },
  close: {
    position: 'absolute', top: 16, right: 20, border: 'none', background: 'transparent',
    fontSize: 22, lineHeight: 1, cursor: 'pointer', color: '#fff',
  },
  mockLabel: {
    position: 'absolute', top: 16, left: 20, fontSize: 11, letterSpacing: 0.5,
    textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)',
  },
}

const dayCell = (selected: boolean, disabled: boolean): CSSProperties => ({
  aspectRatio: '1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  fontSize: 13,
  border: 'none',
  cursor: disabled ? 'default' : 'pointer',
  color: disabled ? '#cbd5e1' : selected ? '#fff' : '#0369a1',
  background: selected ? '#0369a1' : disabled ? 'transparent' : '#e0f2fe',
  fontWeight: selected ? 700 : 500,
})

const slotButton = (selected: boolean): CSSProperties => ({
  padding: '10px 12px',
  borderRadius: 6,
  border: `1px solid ${selected ? '#0369a1' : '#bae6fd'}`,
  background: selected ? '#0369a1' : '#fff',
  color: selected ? '#fff' : '#0369a1',
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer',
})

export function PopupModal({ url, open, onModalClose, rootElement }: PopupModalProps) {
  const now = new Date()
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  if (!open) return null

  const year = now.getFullYear()
  const month = now.getMonth()
  const monthLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return createPortal(
    <div style={styles.overlay} onClick={onModalClose}>
      <span style={styles.mockLabel}>
        {`Mock calendar · ${new URL(url).pathname}`}
      </span>
      <button type='button' style={styles.close} onClick={onModalClose} aria-label='Close'>×</button>
      <div style={styles.card} onClick={e => e.stopPropagation()}>
        <div style={styles.left}>
          <span style={styles.host}>Acme Team</span>
          <h2 style={styles.title}>Book a call</h2>
          <div style={styles.meta}>⏱ 30 min</div>
          <div style={styles.meta}>📹 Video conferencing details on confirmation</div>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 'auto' }}>
            {selectedDay && selectedSlot
              ? `Selected ${monthLabel.split(' ')[0]} ${selectedDay} at ${selectedSlot}`
              : 'Select a day and time that works for you.'}
          </p>
        </div>
        <div style={styles.right}>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 12 }}>{monthLabel}</div>
            <div style={styles.grid}>
              {WEEKDAYS.map(d => <div key={d} style={styles.weekday}>{d}</div>)}
              {cells.map((day, i) => day === null
                ? <div key={`pad-${i}`} />
                : (
                  <button
                    key={day}
                    type='button'
                    disabled={day < now.getDate()}
                    style={dayCell(selectedDay === day, day < now.getDate())}
                    onClick={() => setSelectedDay(day)}
                  >
                    {day}
                  </button>
                ))}
            </div>
          </div>
          <div style={styles.slotsCol}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>
              {selectedDay ? `${monthLabel.split(' ')[0]} ${selectedDay}` : 'Pick a day'}
            </div>
            {selectedDay && TIME_SLOTS.map(slot => (
              <button
                key={slot}
                type='button'
                style={slotButton(selectedSlot === slot)}
                onClick={() => setSelectedSlot(slot)}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>,
    rootElement,
  )
}

export function useCalendlyEventListener() {}
