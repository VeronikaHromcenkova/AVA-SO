import { Dialog, FontIcon } from '@fluentui/react'
import { Copy20Regular as CopyIcon } from '@fluentui/react-icons'

import styles from './Dialog.module.css'

interface ShareDialogProps {
  isOpen: boolean
  isCopied: boolean
  onCopyClick: () => void
  onClose: () => void
}

const ShareDialog = ({ isOpen, isCopied, onCopyClick, onClose }: ShareDialogProps) => {
  return (
    <Dialog
      onDismiss={onClose}
      hidden={!isOpen}
      dialogContentProps={{
        title: 'Share the web app',
        showCloseButton: true
      }}>
      <div className={styles.urlTextBox} onClick={onCopyClick}>
        <input className={styles.urlInput} type="text" value={window.location.href} readOnly />
        {isCopied ? (
          <FontIcon iconName={'Accept'} className={styles.acceptIcon} />
        ) : (
          <CopyIcon
            className={styles.copyButton}
            tabIndex={0}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ' ? onCopyClick() : null)}
          />
        )}
      </div>
    </Dialog>
  )
}

export default ShareDialog
