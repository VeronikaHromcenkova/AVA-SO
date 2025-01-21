import React, { useContext } from "react";
import { Stack, StackItem, Text } from "@fluentui/react";

import { ChatHistoryLoadingState } from "../../../api";
import { AppStateContext } from "../../../state/AppProvider";
import { groupByMonth } from "../../../utils/chatHistory";

import { ChatHistoryListGroups } from "./ChatHistoryListGroups";

interface ChatHistoryListProps {}

const ChatHistoryList: React.FC<ChatHistoryListProps> = () => {
  const appStateContext = useContext(AppStateContext);
  const chatHistory = appStateContext?.state.chatHistory;

  if (
    appStateContext?.state.chatHistoryLoadingState != ChatHistoryLoadingState.Success &&
    !appStateContext?.state.isCosmosDBAvailable.cosmosDB
  )
    return null;

  if (!chatHistory || chatHistory.length < 0) {
    return (
      <Stack horizontal horizontalAlign="center" verticalAlign="center" style={{ width: "100%", marginTop: 10 }}>
        <StackItem>
          <Text style={{ alignSelf: "center", fontWeight: "400", fontSize: 14 }}>
            <span>No chat history.</span>
          </Text>
        </StackItem>
      </Stack>
    );
  }

  return <ChatHistoryListGroups groupedChatHistory={groupByMonth(chatHistory)} />;
};

export default ChatHistoryList;
