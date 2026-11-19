import { useEffect, useState, type CSSProperties } from "react"

/**
 * Keeps a bottom-anchored panel above the phone's on-screen keyboard.
 * Same approach as the floating chat of the portfolio: read the visual viewport
 * (it shrinks when the keyboard opens), lift the panel by the keyboard height and
 * cap its height to the visible area. Page scroll is locked while it is mounted.
 * Below the `sm` breakpoint only; desktop gets empty styles.
 */
export function useKeyboardViewport() {
  const [containerStyle, setContainerStyle] = useState<CSSProperties>({})
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({})

  useEffect(() => {
    const vp = window.visualViewport
    if (!vp) return

    const update = () => {
      if (window.innerWidth >= 640) {
        setContainerStyle({})
        setPanelStyle({})
        return
      }
      const keyboardHeight = Math.max(0, window.innerHeight - vp.height - vp.offsetTop)
      setContainerStyle({ paddingBottom: `${keyboardHeight + 16}px` })
      setPanelStyle({ maxHeight: `${vp.height - 32}px` })
    }

    vp.addEventListener("resize", update)
    vp.addEventListener("scroll", update)
    window.addEventListener("resize", update)
    update()
    return () => {
      vp.removeEventListener("resize", update)
      vp.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [])

  // Lock page scroll on phones while the panel is open
  useEffect(() => {
    if (window.innerWidth >= 640) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  return { containerStyle, panelStyle }
}
