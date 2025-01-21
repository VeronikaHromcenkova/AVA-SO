import { Answer } from "../Answer";

import styles from "../Answer.module.css";

interface LoadingAnswerProps {
  show: boolean;
}

const LoadingAnswer = ({ show }: LoadingAnswerProps) => {
  if (!show) return null;

  return (
    <div className={styles.loadingMessage}>
      <Answer
        answer={{
          answer: "Generating answer...",
          citations: [],
          generated_chart: null
        }}
        onCitationClicked={() => null}
        onExectResultClicked={() => null}
      />
    </div>
  );
};

export default LoadingAnswer;
