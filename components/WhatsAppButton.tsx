'use client'

import { useState, useRef, useEffect } from 'react'

export default function WhatsAppButton() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [initialized, setInitialized] = useState(false)
  const dragging = useRef(false)
  const hasMoved = useRef(false)
  const startPointer = useRef({ x: 0, y: 0 })
  const startPos = useRef({ x: 0, y: 0 })
  const currentPos = useRef({ x: 0, y: 0 })
  const buttonRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('whatsapp-btn-pos')
    let initial: { x: number; y: number }
    if (saved) {
      const parsed = JSON.parse(saved)
      initial = {
        x: Math.min(parsed.x, window.innerWidth - 140),
        y: Math.min(parsed.y, window.innerHeight - 56),
      }
    } else {
      initial = { x: window.innerWidth - 148, y: window.innerHeight - 72 }
    }
    setPos(initial)
    currentPos.current = initial
    setInitialized(true)
  }, [])

  const handlePointerDown = (e: React.PointerEvent) => {
    dragging.current = true
    hasMoved.current = false
    startPointer.current = { x: e.clientX, y: e.clientY }
    startPos.current = { ...currentPos.current }
    buttonRef.current?.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return
    const dx = e.clientX - startPointer.current.x
    const dy = e.clientY - startPointer.current.y
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) hasMoved.current = true
    const newX = Math.max(0, Math.min(window.innerWidth - 140, startPos.current.x + dx))
    const newY = Math.max(0, Math.min(window.innerHeight - 56, startPos.current.y + dy))
    const newPos = { x: newX, y: newY }
    currentPos.current = newPos
    setPos(newPos)
  }

  const handlePointerUp = () => {
    if (!dragging.current) return
    dragging.current = false
    if (hasMoved.current) {
      localStorage.setItem('whatsapp-btn-pos', JSON.stringify(currentPos.current))
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    if (hasMoved.current) e.preventDefault()
  }

  if (!initialized) return null

  return (
    <a
      ref={buttonRef}
      href="https://wa.me/33769832944"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Nous contacter sur WhatsApp"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={handleClick}
      style={{ left: pos.x, top: pos.y, touchAction: 'none' }}
      className="fixed z-50 flex items-center gap-3 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-shadow cursor-grab active:cursor-grabbing select-none"
    >
      <svg className="w-6 h-6 shrink-0" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
      <span className="font-sans text-sm font-medium">WhatsApp</span>
    </a>
  )
}
