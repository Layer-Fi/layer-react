import { useState, useEffect, useRef, ReactNode, TouchEvent, MouseEvent } from 'react'
import classNames from 'classnames'

export interface ServiceOfferingCarouselProps {
  children: ReactNode[]
  className?: string
  autoSlide?: boolean
  autoSlideInterval?: number
  transitionDuration?: number
}

/**
 * A lightweight carousel component for displaying service offerings
 *
 * @param children - Array of slide elements to display in the carousel
 * @param className - Additional CSS classes
 * @param autoSlide - Enable automatic slide transitions (default: true)
 * @param autoSlideInterval - Time between auto slides in ms (default: 5000)
 * @param transitionDuration - Transition animation duration in ms (default: 300)
 */
export const ServiceOfferingCarousel = ({
  children,
  className,
  autoSlide = true,
  autoSlideInterval = 12000,
  transitionDuration = 500,
}: ServiceOfferingCarouselProps) => {
  const slides = Array.isArray(children) ? children : [children]
  const [currentSlide, setCurrentSlide] = useState(0)
  const [dragStart, setDragStart] = useState(0)
  const [dragEnd, setDragEnd] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const autoSlideIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Auto-slide functionality
  useEffect(() => {
    if (!autoSlide || slides.length <= 1) return

    const startAutoSlide = () => {
      if (autoSlideIntervalRef.current) {
        clearInterval(autoSlideIntervalRef.current)
      }
      autoSlideIntervalRef.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % slides.length)
      }, autoSlideInterval)
    }

    startAutoSlide()

    return () => {
      if (autoSlideIntervalRef.current) {
        clearInterval(autoSlideIntervalRef.current)
      }
    }
  }, [autoSlide, autoSlideInterval, slides.length])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    // Reset auto-slide timer on manual navigation
    if (autoSlide && autoSlideIntervalRef.current) {
      clearInterval(autoSlideIntervalRef.current)
      autoSlideIntervalRef.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % slides.length)
      }, autoSlideInterval)
    }
  }

  // Helper function to handle slide navigation after drag/swipe
  const handleDragNavigation = () => {
    if (!isDragging) return
    setIsDragging(false)

    const minSwipeDistance = 50
    const distance = dragStart - dragEnd

    if (Math.abs(distance) < minSwipeDistance) return

    if (distance > 0) {
      // Dragged/swiped left - go to next slide
      setCurrentSlide(prev => (prev + 1) % slides.length)
    }
    else {
      // Dragged/swiped right - go to previous slide
      setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)
    }

    // Reset auto-slide timer after drag/swipe
    if (autoSlide && autoSlideIntervalRef.current) {
      clearInterval(autoSlideIntervalRef.current)
      autoSlideIntervalRef.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % slides.length)
      }, autoSlideInterval)
    }
  }

  // Touch handlers (mobile)
  const handleTouchStart = (e: TouchEvent) => {
    setDragStart(e.targetTouches[0].clientX)
    setIsDragging(true)
  }

  const handleTouchMove = (e: TouchEvent) => {
    setDragEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    handleDragNavigation()
  }

  // Mouse handlers (desktop)
  const handleMouseDown = (e: MouseEvent) => {
    setDragStart(e.clientX)
    setIsDragging(true)
    e.preventDefault() // Prevent text selection
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return
    setDragEnd(e.clientX)
  }

  const handleMouseUp = () => {
    handleDragNavigation()
  }

  const handleMouseLeave = () => {
    if (isDragging) {
      handleDragNavigation()
    }
  }

  return (
    <div className={classNames('Layer__service-offering-carousel', className)}>
      <div
        className='Layer__carousel-track'
        style={{
          transform: `translateX(-${currentSlide * 100}%)`,
          transition: isDragging ? 'none' : `transform ${transitionDuration}ms ease-in-out`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {slides.map((slide, index) => (
          <div key={index} className='Layer__carousel-slide'>
            {slide}
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <div className='Layer__carousel-dots' role='tablist'>
          {slides.map((_, index) => (
            <button
              key={index}
              className={classNames('Layer__carousel-dot', {
                'Layer__carousel-dot--active': index === currentSlide,
              })}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-selected={index === currentSlide}
              role='tab'
              type='button'
            />
          ))}
        </div>
      )}
    </div>
  )
}
