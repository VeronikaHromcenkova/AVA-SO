import { useContext } from "react";

import { CosmosDBStatus } from "../api";
import { AppStateContext } from "../state/AppProvider";

const useChatHistory = () => {
  const appStateContext = useContext(AppStateContext);
  const ui = appStateContext?.state.frontendSettings?.ui;

  const showChatHistory =
    appStateContext?.state.isCosmosDBAvailable?.status !== CosmosDBStatus.NotConfigured &&
    ui?.show_chat_history_button !== false;

  return { showChatHistory };
};

export default useChatHistory;
