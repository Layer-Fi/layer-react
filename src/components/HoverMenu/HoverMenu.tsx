import React, { ReactNode, useEffect, useRef, useState } from 'react'
import classNames from 'classnames'

export interface HoverMenuProps {
  children: ReactNode
  config: { name: string; action: () => void }[]
}

export const HoverMenu = ({ children, config }: HoverMenuProps) => {
  const [openMenu, setOpenMenu] = useState(false)
  const hoverMenuRef = useRef<HTMLDivElement>(null)

  const hoverMenuClassName = classNames(
    'Layer__hover-menu',
    openMenu && '--open',
  )

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        hoverMenuRef.current &&
        !hoverMenuRef.current.contains(event.target as Node)
      ) {
        setOpenMenu(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  return (
    <div
      className={hoverMenuClassName}
      ref={hoverMenuRef}
      onMouseLeave={() => setOpenMenu(false)}
    >
      <div
        className='Layer__hover-menu__children'
        role='button'
        onMouseEnter={() => setOpenMenu(true)}
        onClick={() => setOpenMenu(true)}
      >
        {children}
      </div>
      <div className='Layer__hover-menu__list-wrapper'>
        <ul className='Layer__hover-menu__list'>
          {config &&
            config.length > 0 &&
            config.map(item => (
              <li
                key={`hover-menu-${item.name}`}
                className='Layer__hover-menu__list-item'
              >
                <button
                  className='Layer__hover-menu__list-item-button'
                  onClick={() => item.action()}
                >
                  {item.name}
                </button>
              </li>
            ))}
        </ul>
      </div>
    </div>
  )
}
