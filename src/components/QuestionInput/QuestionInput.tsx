import { useContext, useRef, useState } from "react";
import { FontIcon, Stack, TextField } from "@fluentui/react";
import { Dismiss12Regular as Close, SendRegular } from "@fluentui/react-icons";

import { ChatMessage } from "../../api";
import { AppStateContext } from "../../state/AppProvider";
import { resizeImage } from "../../utils/resizeImage";

import styles from "./QuestionInput.module.css";

interface Props {
  onSend: (question: ChatMessage["content"], id?: string) => void;
  disabled: boolean;
  placeholder?: string;
  clearOnSend?: boolean;
  conversationId?: string;
}

export const QuestionInput = ({ onSend, disabled, placeholder, clearOnSend, conversationId }: Props) => {
  const [question, setQuestion] = useState<string>("");
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const appStateContext = useContext(AppStateContext);
  const hideImageUpload = appStateContext?.state.frontendSettings?.oyd_enabled || false;
  const sendQuestionDisabled = disabled || !question.trim();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      await convertToBase64(file);
    }
  };

  const convertToBase64 = async (file: Blob) => {
    try {
      const resizedBase64 = await resizeImage(file, 800, 800);
      setBase64Image(resizedBase64);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const getQuestionContent = (): ChatMessage["content"] => {
    if (base64Image) {
      return [
        { type: "text", text: question },
        { type: "image_url", image_url: { url: base64Image } }
      ];
    }

    return question.toString();
  };

  const sendQuestion = () => {
    if (sendQuestionDisabled) return;

    const questionContent = getQuestionContent();
    onSend(questionContent, conversationId);
    setBase64Image(null);
    if (clearOnSend) setQuestion("");
  };

  const onEnterPress = (ev: React.KeyboardEvent<Element>) => {
    if (ev.key === "Enter" && !ev.shiftKey && !(ev.nativeEvent?.isComposing === true)) {
      ev.preventDefault();
      sendQuestion();
    }
  };

  const onQuestionChange = (_ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
    setQuestion(newValue || "");
  };

  const handleRemoveImage = () => {
    setBase64Image(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Stack horizontal className={styles.questionInputContainer}>
      <TextField
        className={styles.questionInputTextField}
        inputClassName={styles.questionInputTextArea}
        placeholder={placeholder}
        multiline
        resizable={false}
        borderless
        value={question}
        onChange={onQuestionChange}
        onKeyDown={onEnterPress}
        styles={{
          wrapper: {
            height: "100%"
          },
          fieldGroup: {
            height: "100%"
          }
        }}
      />
      {!hideImageUpload && (
        <div className={styles.fileInputContainer}>
          <input
            type="file"
            id="fileInput"
            onChange={event => handleImageUpload(event)}
            accept="image/*"
            className={styles.fileInput}
            ref={fileInputRef}
          />
          <label htmlFor="fileInput" className={styles.fileLabel} aria-label="Upload Image">
            <FontIcon className={styles.fileIcon} iconName={"PhotoCollection"} aria-label="Upload Image" />
          </label>
        </div>
      )}

      {base64Image && (
        <div className={styles.imageContainer}>
          <Close className={styles.cancelIcon} onClick={handleRemoveImage} />
          <img className={styles.uploadedImage} src={base64Image} alt="Uploaded Preview" />
        </div>
      )}
      <div
        className={styles.questionInputSendButtonContainer}
        role="button"
        tabIndex={0}
        aria-label="Ask question button"
        onClick={sendQuestion}
        onKeyDown={onEnterPress}>
        <SendRegular className={sendQuestionDisabled ? styles.sendButtonDisabled : styles.sendButton} />
      </div>
      <div className={styles.questionInputBottomBorder} />
    </Stack>
  );
};
