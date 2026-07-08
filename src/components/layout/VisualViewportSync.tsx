'use client'

import { useEffect } from 'react'

export default function VisualViewportSync() {
    useEffect(() => {
        const root = document.documentElement

        function syncViewport() {
            const viewport = window.visualViewport

            if (!viewport) {
                root.style.setProperty('--visual-viewport-bottom', '0px')
                root.style.setProperty('--visual-viewport-left', '0px')
                root.style.setProperty('--visual-viewport-width', '100vw')
                return
            }

            const bottom = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
            root.style.setProperty('--visual-viewport-bottom', `${bottom}px`)
            root.style.setProperty('--visual-viewport-left', `${viewport.offsetLeft}px`)
            root.style.setProperty('--visual-viewport-width', `${viewport.width}px`)

            if (window.scrollX !== 0) {
                window.scrollTo(0, window.scrollY)
            }
        }

        syncViewport()
        window.addEventListener('resize', syncViewport)
        window.addEventListener('orientationchange', syncViewport)
        window.visualViewport?.addEventListener('resize', syncViewport)
        window.visualViewport?.addEventListener('scroll', syncViewport)

        return () => {
            window.removeEventListener('resize', syncViewport)
            window.removeEventListener('orientationchange', syncViewport)
            window.visualViewport?.removeEventListener('resize', syncViewport)
            window.visualViewport?.removeEventListener('scroll', syncViewport)
        }
    }, [])

    return null
}
