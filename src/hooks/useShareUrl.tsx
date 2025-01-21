import { useState } from 'react'

const useShareUrl = () => {
  const [isSharePanelOpen, setIsSharePanelOpen] = useState<boolean>(false)
  const [isCopied, setIsCopied] = useState<boolean>(false)

  const handleShareClick = () => {
    setIsSharePanelOpen(true)
  }

  const handleSharePanelDismiss = () => {
    setIsSharePanelOpen(false)
    setIsCopied(false)
  }

  const handleCopyClick = () => {
    navigator.clipboard.writeText(window.location.href)
    setIsCopied(true)
    setTimeout(() => {
      setIsCopied(false)
    }, 3000)
  }

  return { isSharePanelOpen, isCopied, handleShareClick, handleSharePanelDismiss, handleCopyClick }
}

export default useShareUrl
