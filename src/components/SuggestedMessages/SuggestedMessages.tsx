import { useState } from "react";
import { ArrowLeftRegular as ArrowLeft } from "@fluentui/react-icons";

import { ChatMessage } from "../../api/models";

import { suggestedQuestion } from "./promptsDummyData";

import styles from "./SuggestedMessages.module.css";

export interface SuggestedQuestion {
  title: string;
  message: string;
  children?: SuggestedQuestion[];
}

interface SuggestedMessagesProps {
  sendMessage: (question: ChatMessage["content"], conversationId?: string) => void;
}

const SuggestedMessages = ({ sendMessage }: SuggestedMessagesProps) => {
  const [prompts, setPrompts] = useState<SuggestedQuestion[]>(suggestedQuestion);
  const [showBackBtn, setShowBackBtn] = useState<boolean>(false);

  const onMessageClick = (prompt: SuggestedQuestion) => {
    if (prompt.children?.length) {
      setPrompts(prompt.children);
      setShowBackBtn(true);
    } else {
      sendMessage(prompt.message);
      setShowBackBtn(false);
    }
  };

  const onBackClick = () => {
    setPrompts(suggestedQuestion);
    setShowBackBtn(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.boxesWrapper}>
        {prompts.map((prompt, index) => {
          return (
            <div className={styles.box} tabIndex={0} role="button" key={index} onClick={() => onMessageClick(prompt)}>
              <p>{prompt.title}</p>
            </div>
          );
        })}
      </div>

      <button
        className={styles.backBtn}
        style={{ visibility: showBackBtn ? "visible" : "hidden" }}
        onClick={onBackClick}>
        <ArrowLeft /> Back
      </button>
    </div>
  );
};

export default SuggestedMessages;
