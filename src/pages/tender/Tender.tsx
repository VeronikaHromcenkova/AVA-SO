import { useContext } from "react";
import { Dialog, Stack } from "@fluentui/react";

import LoadingAnswer from "../../components/Answer/components/LoadingAnswer";
import EmptyChatView from "../../components/EmptyChatView/EmptyChatView";
import Messages from "../../components/Messages/Messages";
import PdfViewer from "../../components/PdfViewer/PdfViewer";
import { QuestionInput } from "../../components/QuestionInput";
import Sidebar from "../../components/Sidebar/Sidebar";
import StopGeneratingButton from "../../components/StopGeneratingButton/StopGeneratingButton";
import useChat from "../../hooks/useChat";
import { AppStateContext } from "../../state/AppProvider";

import pdfFile from "./tender-sample.pdf";

import styles from "./Tender.module.css";

const Tender = () => {
  const appStateContext = useContext(AppStateContext);
  const {
    messages,
    execResults,
    showLoadingMessage,
    isLoading,
    chatMessageStreamEnd,
    hideErrorDialog,
    modalProps,
    errorDialogContentProps,
    answerId,
    clearChat,
    newChat,
    stopGenerating,
    onShowCitation,
    disabledButton,
    onShowExecResult,
    handleErrorDialogClose,
    sendMessage
  } = useChat();

  const noMessages = !messages || messages.length < 1;
  const showStopGeneratingButton = isLoading && messages.length > 0;

  return (
    <div className={styles.container} role="main">
      <div className={styles.chatRoot}>
        <div className={styles.chatContainer}>
          {noMessages ? (
            <div className={styles.chatEmptyStateContainer}>
              <EmptyChatView />
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

        <div className={`${styles.pdfContainer} ${noMessages ? "" : styles.showPdf}`}>
          <div className={styles.separator} />
          <PdfViewer pdfUrl={pdfFile} initialPage={1} highlightedText={["vergabe@hsbi.de"]} />
        </div>

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

export default Tender;
