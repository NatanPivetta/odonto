'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

type OverflowItem = {
    selector: string
    left: number
    right: number
    width: number
    className: string
}

function selectorFor(element: Element) {
    const tag = element.tagName.toLowerCase()
    const id = element.id ? `#${element.id}` : ''
    const className = typeof element.className === 'string'
        ? element.className.trim().split(/\s+/).filter(Boolean).slice(0, 4).map((c) => `.${c}`).join('')
        : ''

    return `${tag}${id}${className}`
}

export default function LayoutDebugOverlay() {
    const searchParams = useSearchParams()
    const enabled = searchParams.get('debugLayout') === '1'
    const [items, setItems] = useState<OverflowItem[]>([])
    const [metrics, setMetrics] = useState({
        innerWidth: 0,
        clientWidth: 0,
        scrollWidth: 0,
        scrollX: 0,
    })

    useEffect(() => {
        if (!enabled) return

        function measure() {
            const viewportWidth = window.innerWidth
            const nextItems = Array.from(document.body.querySelectorAll('*'))
                .map((element) => {
                    const rect = element.getBoundingClientRect()
                    return { element, rect }
                })
                .filter(({ rect }) => rect.width > 0 && (rect.right > viewportWidth + 1 || rect.left < -1))
                .slice(0, 8)
                .map(({ element, rect }) => ({
                    selector: selectorFor(element),
                    left: Math.round(rect.left),
                    right: Math.round(rect.right),
                    width: Math.round(rect.width),
                    className: typeof element.className === 'string' ? element.className : '',
                }))

            setMetrics({
                innerWidth: window.innerWidth,
                clientWidth: document.documentElement.clientWidth,
                scrollWidth: document.documentElement.scrollWidth,
                scrollX: Math.round(window.scrollX),
            })
            setItems(nextItems)
        }

        measure()
        window.addEventListener('resize', measure)
        window.visualViewport?.addEventListener('resize', measure)
        window.visualViewport?.addEventListener('scroll', measure)
        const id = window.setInterval(measure, 1000)

        return () => {
            window.removeEventListener('resize', measure)
            window.visualViewport?.removeEventListener('resize', measure)
            window.visualViewport?.removeEventListener('scroll', measure)
            window.clearInterval(id)
        }
    }, [enabled])

    if (!enabled) return null

    return (
        <div className="fixed left-2 top-16 z-[9999] max-w-[calc(100vw-16px)] rounded-md bg-black/85 p-2 font-mono text-[10px] leading-snug text-white shadow-lg">
            <div>
                iw:{metrics.innerWidth} cw:{metrics.clientWidth} sw:{metrics.scrollWidth} sx:{metrics.scrollX}
            </div>
            {items.length === 0 ? (
                <div>overflow: none</div>
            ) : (
                items.map((item, index) => (
                    <div key={`${item.selector}-${index}`} className="mt-1 border-t border-white/20 pt-1">
                        <div>{index + 1}. {item.selector}</div>
                        <div>l:{item.left} r:{item.right} w:{item.width}</div>
                        <div className="max-w-[320px] truncate opacity-70">{item.className}</div>
                    </div>
                ))
            )}
        </div>
    )
}
