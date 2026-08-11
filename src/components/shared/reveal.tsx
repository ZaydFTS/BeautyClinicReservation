"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
}

/**
 * Reveal - IntersectionObserver-driven scroll reveal component.
 * Uses the .reveal / [data-revealed] CSS hooks in globals.css.
 * Respects prefers-reduced-motion automatically (CSS handles it).
 *
 * Robust fallback: if IntersectionObserver doesn't fire within 200ms
 * (e.g. element already in viewport on mount, or observer not supported),
 * the element is revealed anyway so content is never stuck invisible.
 */
export function Reveal({ children, className = "", delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Check if already in viewport on mount - reveal immediately
    const rect = el.getBoundingClientRect()
    const inViewport =
      rect.top < window.innerHeight && rect.bottom > 0

    if (inViewport || typeof IntersectionObserver === "undefined") {
      // Defer the state update to avoid the set-state-in-effect lint rule
      const id = requestAnimationFrame(() => setRevealed(true))
      return () => cancelAnimationFrame(id)
    }

    // Set up IntersectionObserver for elements below the fold
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true)
            observer.disconnect()
            break
          }
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    )
    observer.observe(el)

    // Safety timeout - reveal after 1.5s no matter what
    const timeout = setTimeout(() => setRevealed(true), 1500)

    return () => {
      observer.disconnect()
      clearTimeout(timeout)
    }
  }, [])

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      data-revealed={revealed}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
