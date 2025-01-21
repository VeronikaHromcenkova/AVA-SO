import { SquareRegular } from "@fluentui/react-icons";

import styles from "./StopGeneratingButton.module.css";

interface Props {
  stopGenerating: () => void;
}

const StopGeneratingButton = ({ stopGenerating }: Props) => {
  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      stopGenerating();
    }
  };
  return (
    <button
      className={styles.stopGeneratingContainer}
      aria-label="Stop generating"
      tabIndex={0}
      onClick={stopGenerating}
      onKeyDown={onKeyDown}>
      <SquareRegular className={styles.stopGeneratingIcon} aria-hidden="true" />
      <span className={styles.stopGeneratingText} aria-hidden="true">
        Stop generating
      </span>
    </button>
  );
};

export default StopGeneratingButton;
