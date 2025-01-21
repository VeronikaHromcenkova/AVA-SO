import { useCallback, useContext, useEffect, useRef } from "react";
import { css } from "@fluentui/react";
import { AddFilled, BroomRegular, Share16Regular as Share } from "@fluentui/react-icons";

import { CosmosDBStatus } from "../../api";
import useChatHistory from "../../hooks/useChatHistory";
import useShareUrl from "../../hooks/useShareUrl";
import { AppStateContext } from "../../state/AppProvider";
import { ChatHistory } from "../ChatHistory/ChatHistory";
import ShareDialog from "../Dialogs/ShareDialog";

import styles from "./Sidebar.module.css";

interface SidebarProps {
  open: boolean;
  newChat: () => void;
  clearChat: () => void;
  disabledButton: () => boolean;
}

const Sidebar = ({ open, newChat, clearChat, disabledButton }: SidebarProps) => {
  const appStateContext = useContext(AppStateContext);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const ui = appStateContext?.state.frontendSettings?.ui;
  const noDbConfigured = appStateContext?.state.isCosmosDBAvailable?.status !== CosmosDBStatus.NotConfigured;
  const { showChatHistory } = useChatHistory();

  const { isSharePanelOpen, isCopied, handleShareClick, handleCopyClick, handleSharePanelDismiss } = useShareUrl();
  const toggleClass = open ? styles.opened : styles.closed;

  const toggleSidebarOpen = useCallback(() => {
    appStateContext?.dispatch({ type: "TOGGLE_SIDEBAR_MENU" });
  }, [appStateContext]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && open) {
        toggleSidebarOpen();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, toggleSidebarOpen]);

  const handleClearChat = () => {
    if (noDbConfigured) {
      clearChat();
    } else newChat();

    toggleSidebarOpen();
  };

  return (
    <aside ref={sidebarRef} className={css(styles.sidebar, toggleClass)}>
      <div>
        {ui?.show_share_button && (
          <button type="button" className={styles.button} onClick={handleShareClick}>
            <Share className={styles.buttonIcon} />
            Share
          </button>
        )}
        {noDbConfigured && (
          <button
            type="button"
            className={styles.button}
            onClick={() => {
              newChat();
              toggleSidebarOpen();
            }}
            disabled={disabledButton()}
            aria-label="start a new chat button">
            <AddFilled className={styles.buttonIcon} />
            Start new chat
          </button>
        )}
        <button
          type="button"
          className={styles.button}
          onClick={handleClearChat}
          disabled={disabledButton()}
          aria-label="clear chat button">
          <BroomRegular className={styles.buttonIcon} />
          Clear chat
        </button>
      </div>
      {showChatHistory && <ChatHistory />}
      <ShareDialog
        isOpen={isSharePanelOpen}
        isCopied={isCopied}
        onClose={handleSharePanelDismiss}
        onCopyClick={handleCopyClick}
      />
    </aside>
  );
};

export default Sidebar;
