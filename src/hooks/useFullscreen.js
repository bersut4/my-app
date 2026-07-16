import { useCallback, useEffect, useState } from 'react'

// 사파리/구형 브라우저 대비 webkit 접두사 폴백 포함
function requestFullscreen(el) {
  const req = el.requestFullscreen || el.webkitRequestFullscreen
  return req?.call(el)
}

function exitFullscreen() {
  const exit = document.exitFullscreen || document.webkitExitFullscreen
  return exit?.call(document)
}

function currentFullscreenElement() {
  return document.fullscreenElement || document.webkitFullscreenElement || null
}

export function useFullscreen(ref) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handler = () => setIsFullscreen(currentFullscreenElement() === ref.current)
    document.addEventListener('fullscreenchange', handler)
    document.addEventListener('webkitfullscreenchange', handler)
    return () => {
      document.removeEventListener('fullscreenchange', handler)
      document.removeEventListener('webkitfullscreenchange', handler)
    }
  }, [ref])

  const toggle = useCallback(() => {
    if (!ref.current) return
    if (currentFullscreenElement()) exitFullscreen()
    else requestFullscreen(ref.current)
  }, [ref])

  return { isFullscreen, toggle }
}
