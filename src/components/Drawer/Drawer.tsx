import { useContext } from 'react'
import { DrawerContext } from '../../contexts/DrawerContext'

const DrawerBackground = ({
  isOpen,
  isClosing,
  onClose,
}: {
  isOpen: boolean
  isClosing: boolean
  onClose: () => void
}) => (
  <div
    className={`Layer__drawer-background ${isClosing ? 'closing' : ''} ${
      isOpen ? 'open' : ''
    }`}
    onClick={onClose}
  >
  </div>
)

export const Drawer = ({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}) => {
  const { isClosing, finishClosing } = useContext(DrawerContext)

  return (
    <>
      <DrawerBackground
        isOpen={isOpen}
        onClose={onClose}
        isClosing={isClosing}
      />
      <div
        className={`Layer__drawer ${isClosing ? 'closing' : ''} ${
          isOpen ? 'open' : ''
        }`}
        onTransitionEnd={({ propertyName }) => {
          if (propertyName === 'bottom' && isClosing) {
            finishClosing()
          }
        }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </>
  )
}
