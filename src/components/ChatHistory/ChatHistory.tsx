import { useContext } from "react";
import React from "react";
import {
  CommandBarButton,
  ContextualMenu,
  DefaultButton,
  Dialog,
  DialogFooter,
  DialogType,
  IContextualMenuItem,
  IStackStyles,
  PrimaryButton,
  Spinner,
  SpinnerSize,
  Stack,
  Text
} from "@fluentui/react";
import { useBoolean } from "@fluentui/react-hooks";

import { ChatHistoryLoadingState, historyDeleteAll } from "../../api";
import { AppStateContext } from "../../state/AppProvider";

import ChatHistoryList from "./components/ChatHistoryList";

import styles from "./ChatHistory.module.css";

const commandBarButtonStyle: Partial<IStackStyles> = { root: { height: "50px" } };

export function ChatHistory() {
  const appStateContext = useContext(AppStateContext);

  const [showContextualMenu, setShowContextualMenu] = React.useState(false);
  const [hideClearAllDialog, { toggle: toggleClearAllDialog }] = useBoolean(true);
  const [clearing, setClearing] = React.useState(false);
  const [clearingError, setClearingError] = React.useState(false);

  const isLoadingChatHistory = appStateContext?.state.chatHistoryLoadingState === ChatHistoryLoadingState.Loading;
  const showError =
    appStateContext?.state.chatHistoryLoadingState === ChatHistoryLoadingState.Fail &&
    appStateContext?.state.isCosmosDBAvailable;
  const cosmosDBStatus = appStateContext?.state.isCosmosDBAvailable?.status;

  const clearAllDialogContentProps = {
    type: DialogType.close,
    title: !clearingError ? "Are you sure you want to clear all chat history?" : "Error deleting all of chat history",
    closeButtonAriaLabel: "Close",
    subText: !clearingError
      ? "All chat history will be permanently removed."
      : "Please try again. If the problem persists, please contact the site administrator."
  };

  const modalProps = {
    titleAriaId: "labelId",
    subtitleAriaId: "subTextId",
    isBlocking: true,
    styles: { main: { maxWidth: 450 } }
  };

  const menuItems: IContextualMenuItem[] = [
    { key: "clearAll", text: "Clear all chat history", iconProps: { iconName: "Delete" } }
  ];

  const toggleContextualMenu = (ev: React.MouseEvent<HTMLElement>) => {
    ev.preventDefault(); // don't navigate
    setShowContextualMenu(prev => !prev);
  };

  const onClearAllChatHistory = async () => {
    setClearing(true);
    const response = await historyDeleteAll();
    if (!response.ok) {
      setClearingError(true);
    } else {
      appStateContext?.dispatch({ type: "DELETE_CHAT_HISTORY" });
      toggleClearAllDialog();
    }
    setClearing(false);
  };

  const onHideClearAllDialog = () => {
    toggleClearAllDialog();
    setTimeout(() => {
      setClearingError(false);
    }, 2000);
  };

  return (
    <section className={styles.container} data-is-scrollable aria-label={"chat history panel"}>
      <Stack horizontal horizontalAlign="space-between" verticalAlign="center" wrap aria-label="chat history header">
        <Text role="heading" aria-level={2} className={styles.header}>
          Chat history
        </Text>
        <Stack horizontal styles={commandBarButtonStyle}>
          <CommandBarButton
            iconProps={{ iconName: "More" }}
            title={"Clear all chat history"}
            onClick={toggleContextualMenu}
            aria-label={"clear all chat history"}
            className={styles.moreButton}
            role="button"
            id="moreButton"
          />
          <ContextualMenu
            items={menuItems}
            hidden={!showContextualMenu}
            target={"#moreButton"}
            onItemClick={toggleClearAllDialog}
            onDismiss={() => setShowContextualMenu(false)}
          />
        </Stack>
      </Stack>

      <Stack aria-label="chat history panel content" className={styles.chatHistoryListContainer}>
        <ChatHistoryList />

        {showError && (
          <Stack horizontalAlign="center" verticalAlign="center" style={{ width: "100%", marginTop: 10 }}>
            {cosmosDBStatus && <Text style={{ fontSize: 16 }}>{cosmosDBStatus.toString()}</Text>}
            {!cosmosDBStatus && <span>Error loading chat history</span>}
            <Text>Chat history can't be saved at this time</Text>
          </Stack>
        )}

        {isLoadingChatHistory && (
          <Stack horizontal horizontalAlign="center" verticalAlign="center" style={{ width: "100%", marginTop: 10 }}>
            <Spinner style={{ marginRight: "5px" }} size={SpinnerSize.medium} />
            <Text style={{ alignSelf: "center", whiteSpace: "pre-wrap" }}>Loading chat history</Text>
          </Stack>
        )}
      </Stack>

      <Dialog
        hidden={hideClearAllDialog}
        onDismiss={clearing ? () => {} : onHideClearAllDialog}
        dialogContentProps={clearAllDialogContentProps}
        modalProps={modalProps}>
        <DialogFooter>
          {!clearingError && <PrimaryButton onClick={onClearAllChatHistory} disabled={clearing} text="Clear All" />}
          <DefaultButton
            onClick={onHideClearAllDialog}
            disabled={clearing}
            text={!clearingError ? "Cancel" : "Close"}
          />
        </DialogFooter>
      </Dialog>
    </section>
  );
}
