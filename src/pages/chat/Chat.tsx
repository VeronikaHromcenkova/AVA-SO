import { useContext } from "react";
import { Dialog, Stack } from "@fluentui/react";

import LoadingAnswer from "../../components/Answer/components/LoadingAnswer";
import CitationPanel from "../../components/CitationPanel/CitationPanel";
import EmptyChatView from "../../components/EmptyChatView/EmptyChatView";
import IntentsPanel from "../../components/IntentsPanel/IntentsPanel";
import Messages from "../../components/Messages/Messages";
import { QuestionInput } from "../../components/QuestionInput";
import Sidebar from "../../components/Sidebar/Sidebar";
import StopGeneratingButton from "../../components/StopGeneratingButton/StopGeneratingButton";
import SuggestedMessages from "../../components/SuggestedMessages/SuggestedMessages";
import useChat from "../../hooks/useChat";
import { AppStateContext } from "../../state/AppProvider";

import styles from "./Chat.module.css";

const Chat = () => {
  const appStateContext = useContext(AppStateContext);
  const {
    messages,
    execResults,
    showLoadingMessage,
    isLoading,
    activeCitation,
    isCitationPanelOpen,
    isIntentsPanelOpen,
    chatMessageStreamEnd,
    hideErrorDialog,
    modalProps,
    errorDialogContentProps,
    answerId,
    clearChat,
    newChat,
    stopGenerating,
    onShowCitation,
    onViewSource,
    disabledButton,
    onShowExecResult,
    handleErrorDialogClose,
    setIsCitationPanelOpen,
    setIsIntentsPanelOpen,
    sendMessage
  } = useChat();

  const showCitationPanel = messages && messages.length > 0 && isCitationPanelOpen && activeCitation;
  const showIntentsPanel = messages && messages.length > 0 && isIntentsPanelOpen;
  const noMessages = !messages || messages.length < 1;
  const showStopGeneratingButton = isLoading && messages.length > 0;

  return (
    <div className={styles.container} role="main">
      <div className={styles.chatRoot}>
        <div className={styles.chatContainer}>
          {noMessages ? (
            <div className={styles.chatEmptyStateContainer}>
              <EmptyChatView />
              <SuggestedMessages sendMessage={sendMessage} />
            </div>
          ) : (
            <div className={styles.chatMessageStream} style={{ marginBottom: isLoading ? "40px" : "0px" }} role="log">
              <Messages
                messages={messages}
                execResults={execResults}
                onShowCitation={onShowCitation}
                onShowExecResult={() => onShowExecResult(answerId)}
              />
              <LoadingAnswer show={showLoadingMessage} />
              <div ref={chatMessageStreamEnd} />
            </div>
          )}

          <Stack horizontal className={styles.chatInput}>
            {showStopGeneratingButton && <StopGeneratingButton stopGenerating={stopGenerating} />}
            <QuestionInput
              clearOnSend
              placeholder="Type a new question..."
              disabled={isLoading}
              onSend={(question, id) => sendMessage(question, id)}
              conversationId={
                appStateContext?.state.currentChat?.id ? appStateContext?.state.currentChat?.id : undefined
              }
            />
          </Stack>
        </div>

        <CitationPanel
          show={!!showCitationPanel}
          activeCitation={activeCitation}
          onClose={() => setIsCitationPanelOpen(false)}
          onViewSource={onViewSource}
        />
        <IntentsPanel
          show={showIntentsPanel}
          answerExecResult={appStateContext?.state?.answerExecResult[answerId]}
          onClose={() => setIsIntentsPanelOpen(false)}
        />
        <Sidebar
          open={!!appStateContext?.state.isSidebarMenuOpen}
          newChat={newChat}
          clearChat={clearChat}
          disabledButton={disabledButton}
        />
        <Dialog
          hidden={hideErrorDialog}
          onDismiss={handleErrorDialogClose}
          dialogContentProps={errorDialogContentProps}
          modalProps={modalProps}
        />
      </div>
    </div>
  );
};

export default Chat;
