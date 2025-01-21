import { useContext, useEffect, useState } from 'react'
import { AppStateContext } from '../state/AppProvider'
import { getUserInfo } from '../api'

const useAuthWarning = () => {
  const appStateContext = useContext(AppStateContext)
  const AUTH_ENABLED = appStateContext?.state.frontendSettings?.auth_enabled
  const [showAuthMessage, setShowAuthMessage] = useState<boolean | undefined>()

  useEffect(() => {
    if (AUTH_ENABLED !== undefined) getUserInfoList()
  }, [AUTH_ENABLED])

  const getUserInfoList = async () => {
    if (!AUTH_ENABLED) {
      setShowAuthMessage(false)
      return
    }
    const userInfoList = await getUserInfo()
    if (userInfoList.length === 0 && window.location.hostname !== '127.0.0.1') {
      setShowAuthMessage(true)
    } else {
      setShowAuthMessage(false)
    }
  }

  return { showAuthMessage }
}

export default useAuthWarning
