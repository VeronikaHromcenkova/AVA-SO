import { ChatMessage, Citation, ToolMessageContent } from "../api/models";

export const createCitationFilepath = (citation: Citation, index: number, truncate: boolean = false) => {
  const filePathTruncationLimit = 50;
  let citationFilename = "";

  if (citation.filepath) {
    const part_i = citation.part_index ?? (citation.chunk_id ? parseInt(citation.chunk_id) + 1 : "");
    if (truncate && citation.filepath.length > filePathTruncationLimit) {
      const citationLength = citation.filepath.length;
      citationFilename = `${citation.filepath.substring(0, 20)}...${citation.filepath.substring(citationLength - 20)} - Part ${part_i}`;
    } else {
      citationFilename = `${citation.filepath} - Part ${part_i}`;
    }
  } else if (citation.filepath && citation.reindex_id) {
    citationFilename = `${citation.filepath} - Part ${citation.reindex_id}`;
  } else {
    citationFilename = `Citation ${index}`;
  }
  return citationFilename;
};

export const parseCitationFromMessage = (message: ChatMessage) => {
  if (message?.role && message?.role === "tool" && typeof message?.content === "string") {
    try {
      const toolMessage = JSON.parse(message.content) as ToolMessageContent;
      return toolMessage.citations;
    } catch {
      return [];
    }
  }
  return [];
};
