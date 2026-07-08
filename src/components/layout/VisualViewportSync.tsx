'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function VisualViewportSync() {
    const pathname = usePathname()

    useEffect(() => {
        const root = document.documentElement

        function resetHorizontalScroll() {
            document.documentElement.scrollLeft = 0
            document.body.scrollLeft = 0

            if (window.scrollX !== 0) {
                window.scrollTo({ left: 0, top: window.scrollY, behavior: 'instant' })
            }
        }

        function syncViewport() {
            const viewport = window.visualViewport

            if (!viewport) {
                root.style.setProperty('--visual-viewport-bottom', '0px')
                return
            }

            const bottom = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
            root.style.setProperty('--visual-viewport-bottom', `${bottom}px`)
        }

        function syncAndReset() {
            syncViewport()
            requestAnimationFrame(resetHorizontalScroll)
        }

        syncViewport()
        requestAnimationFrame(resetHorizontalScroll)
        window.addEventListener('resize', syncAndReset)
        window.addEventListener('orientationchange', syncAndReset)
        window.visualViewport?.addEventListener('resize', syncViewport)

        return () => {
            window.removeEventListener('resize', syncAndReset)
            window.removeEventListener('orientationchange', syncAndReset)
            window.visualViewport?.removeEventListener('resize', syncViewport)
        }
    }, [pathname])

    return null
}
