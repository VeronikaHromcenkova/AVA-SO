import { Stack } from "@fluentui/react";
import { ErrorCircleRegular } from "@fluentui/react-icons";

import { ChatMessage } from "../../../api";

import styles from "../Answer.module.css";

interface ErrorAnswerProps {
  content: ChatMessage["content"];
}

const ErrorAnswer = ({ content }: ErrorAnswerProps) => {
  return (
    <div className={styles.chatMessageError}>
      <Stack horizontal className={styles.chatMessageErrorContent}>
        <ErrorCircleRegular className={styles.errorIcon} />
        <span>Error</span>
      </Stack>
      <span className={styles.chatMessageErrorContent}>{typeof content === "string" && content}</span>
    </div>
  );
};

export default ErrorAnswer;
