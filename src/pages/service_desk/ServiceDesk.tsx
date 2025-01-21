import { useContext, useState } from "react";
import { Stack } from "@fluentui/react";

import LoadingAnswer from "../../components/Answer/components/LoadingAnswer";
import JiraTicket from "../../components/JiraTicket/JiraTicket";
import Messages from "../../components/Messages/Messages";
import { QuestionInput } from "../../components/QuestionInput";
// import StopGeneratingButton from "../../components/StopGeneratingButton/StopGeneratingButton";
import useChat from "../../hooks/useChat";
import { AppStateContext } from "../../state/AppProvider";

import Header from "./Header";

import styles from "./ServiceDesk.module.css";

const ServiceDesk = () => {
  const appStateContext = useContext(AppStateContext);
  const {
    // messages,
    execResults,
    showLoadingMessage,
    isLoading,
    chatMessageStreamEnd,
    answerId,
    // stopGenerating,
    onShowCitation,
    onShowExecResult
    // sendMessage
  } = useChat();

  // const showStopGeneratingButton = isLoading && messages.length > 0;

  /*** Dummy messages implementation for showcase */

  const initialPrompt = {
    content: "Hi! How can I assist you today?",
    date: new Date().toISOString(),
    id: "assistant-1",
    role: "assistant"
  };
  const [messages, setMessages] = useState([initialPrompt]);

  const sendMessage = (question: any, id?: string) => {
    const newMessage = {
      content: question,
      date: new Date().toISOString(),
      id: id ? id : `user-${messages.length + 1}`,
      role: "user"
    };
    setMessages([...messages, newMessage]);
  };

  return (
    <div className={styles.container} role="main">
      <Header />
      <div className={styles.layout}>
        <JiraTicket />
        <div className={styles.chatRoot}>
          <div className={styles.chatContainer}>
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

            <Stack horizontal className={styles.chatInput}>
              {/* {showStopGeneratingButton && <StopGeneratingButton stopGenerating={stopGenerating} />} */}
              <QuestionInput
                clearOnSend
                placeholder="Ask AVA about the ticket"
                disabled={isLoading}
                onSend={(question, id) => sendMessage(question, id)}
                conversationId={
                  appStateContext?.state.currentChat?.id ? appStateContext?.state.currentChat?.id : undefined
                }
              />
            </Stack>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDesk;
