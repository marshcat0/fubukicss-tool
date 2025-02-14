import { useEffect, useRef, useState } from 'react'

import { CodeArea } from './components/Code'
import { Colors } from './components/Colors'
import { Download } from './components/Download'
import Header from './components/Header'
import { Layout } from './components/Layout'

export default () => {
  const header = useRef<HTMLElement | null>(null)
  const initialPosition = JSON.parse(localStorage.getItem(`fubukicss_position`) || 'null')

  const [minimized, setMinimized] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [shiftPosition, setShiftPosition] = useState([0, 0])
  const [position, setPosition] = useState(initialPosition || [window.innerWidth - 505, 72])

  function handleDragStart(e: React.MouseEvent<Element, MouseEvent>) {
    const metaPosition = header.current?.getBoundingClientRect()
    let shiftX = e.clientX - (metaPosition?.left ?? 0)
    let shiftY = e.clientY - (metaPosition?.top ?? 0)
    setShiftPosition([shiftX, shiftY])
    setIsDragging(true)
  }

  function handleDragEnd() {
    localStorage.setItem(`fubukicss_position`, JSON.stringify(position))
    setIsDragging(false)
  }

  function handleToggleSize() {
    setMinimized(!minimized)
  }

  useEffect(() => {
    function moving(e: MouseEvent) {
      if (isDragging) {
        setPosition([e.pageX - shiftPosition[0], e.pageY - shiftPosition[1]])
      }
    }
    window.addEventListener('mousemove', moving)
    return () => {
      window.removeEventListener('mousemove', moving)
    }
  }, [isDragging, shiftPosition])

  return (
    <div
      className={`fixed overflow-hidden text-xs text-#000 bg-popover rounded border-1 border-#e5e5e5 border-solid shadow-md z-10 antialiased h-auto transition-width !font-['Inter'] js-fullscreen-prevent-event-capture ${minimized ? 'w-50' : 'w-80'}`}
      style={{
        left: position[0],
        top: position[1],
      }}
    >
      <Header
        ref={header}
        onMouseDown={handleDragStart}
        onMouseUp={handleDragEnd}
        minimized={minimized}
        onToggleSize={handleToggleSize}
      />

      <CodeArea minimized={minimized} />

      <Download minimized={minimized} />

      <Colors minimized={minimized} />
    </div>
  )
}
