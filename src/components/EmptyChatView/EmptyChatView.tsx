import { useContext, useMemo } from "react";
import { Stack } from "@fluentui/react";

import Logo from "../../assets/Arvato-logo.svg";
import { AppStateContext } from "../../state/AppProvider";

import styles from "./EmptyChatView.module.css";

const EmptyChatView = () => {
  const appStateContext = useContext(AppStateContext);
  const ui = appStateContext?.state.frontendSettings?.ui;

  const logo = useMemo(
    () => (!appStateContext?.state.isLoading ? ui?.chat_logo || ui?.logo || Logo : ""),
    [appStateContext?.state.isLoading, ui?.chat_logo, ui?.logo]
  );

  return (
    <Stack className={styles.chatEmptyState}>
      <img src={logo} className={styles.chatIcon} aria-hidden="true" alt="chatIcon" />
      <h1 className={styles.chatEmptyStateTitle}>{ui?.chat_title}</h1>
      <h2 className={styles.chatEmptyStateSubtitle}>{ui?.chat_description}</h2>
    </Stack>
  );
};

export default EmptyChatView;
