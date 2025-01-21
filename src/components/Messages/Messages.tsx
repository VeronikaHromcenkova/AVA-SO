import { AnswerRole, ChatMessage, Citation, ExecResults } from "../../api";
import { parseCitationFromMessage } from "../../utils/answerCitations";
import { parsePlotFromMessage } from "../../utils/messages";
import { Answer } from "../Answer";
import ErrorAnswer from "../Answer/components/ErrorAnswer";

import styles from "./Messages.module.css";

interface MessagesProps {
  messages: ChatMessage[];
  execResults: ExecResults[];
  onShowCitation: (citation: Citation) => void;
  onShowExecResult: () => void;
}

const Messages = ({ messages, execResults, onShowCitation, onShowExecResult }: MessagesProps) => {
  const userMessage = (answer: ChatMessage, index: number) => {
    const { content } = answer;
    const hasImage = Array.isArray(content);
    const isText = typeof content === "string" && content;
    const messageText = isText ? content : hasImage ? content[0].text : null;

    return (
      <div className={styles.chatMessageUser} key={`user${index}`}>
        {hasImage && <img className={styles.uploadedImageChat} src={content[1].image_url.url} alt="Uploaded Preview" />}
        <div className={styles.chatMessageUserMessage}>{messageText}</div>
      </div>
    );
  };

  const assistantMessage = (answer: ChatMessage, index: number) => (
    <div className={styles.chatMessageGpt} key={`assistant${index}`}>
      {typeof answer.content === "string" && (
        <Answer
          answer={{
            answer: answer.content,
            citations: parseCitationFromMessage(messages[index - 1]),
            generated_chart: parsePlotFromMessage(messages[index - 1]),
            message_id: answer.id,
            feedback: answer.feedback,
            exec_results: execResults
          }}
          onCitationClicked={c => onShowCitation(c)}
          onExectResultClicked={onShowExecResult}
        />
      )}
    </div>
  );

  return (
    <div>
      {messages.map((answer, index) => {
        switch (answer.role) {
          case AnswerRole.User:
            return userMessage(answer, index);
          case AnswerRole.Assistant:
            return assistantMessage(answer, index);
          case AnswerRole.Error:
            return <ErrorAnswer content={answer.content} key={`error${index}`} />;
          default:
            return null;
        }
      })}
    </div>
  );
};

export default Messages;
