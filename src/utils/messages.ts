import uuid from "react-uuid";

import { AzureSqlServerExecResults, ChatMessage } from "../api/models";

export const parsePlotFromMessage = (message: ChatMessage) => {
  if (message?.role && message?.role === "tool" && typeof message?.content === "string") {
    try {
      const execResults = JSON.parse(message.content) as AzureSqlServerExecResults;
      const codeExecResult = execResults.all_exec_results.at(-1)?.code_exec_result;

      if (codeExecResult === undefined) {
        return null;
      }
      return codeExecResult.toString();
    } catch {
      return null;
    }
    // const execResults = JSON.parse(message.content) as AzureSqlServerExecResults;
    // return execResults.all_exec_results.at(-1)?.code_exec_result;
  }
  return null;
};

export const tryGetRaiPrettyError = (errorMessage: string) => {
  try {
    // Using a regex to extract the JSON part that contains "innererror"
    const match = errorMessage.match(/'innererror': ({.*})\}\}/);
    if (match) {
      // Replacing single quotes with double quotes and converting Python-like booleans to JSON booleans
      const fixedJson = match[1]
        .replace(/'/g, '"')
        .replace(/\bTrue\b/g, "true")
        .replace(/\bFalse\b/g, "false");
      const innerErrorJson = JSON.parse(fixedJson);
      let reason = "";
      // Check if jailbreak content filter is the reason of the error
      const jailbreak = innerErrorJson.content_filter_result.jailbreak;
      if (jailbreak.filtered === true) {
        reason = "Jailbreak";
      }

      // Returning the prettified error message
      if (reason !== "") {
        return (
          "The prompt was filtered due to triggering Azure OpenAI’s content filtering system.\n" +
          "Reason: This prompt contains content flagged as " +
          reason +
          "\n\n" +
          "Please modify your prompt and retry. Learn more: https://go.microsoft.com/fwlink/?linkid=2198766"
        );
      }
    }
  } catch (e) {
    console.error("Failed to parse the error:", e);
  }
  return errorMessage;
};

export const parseErrorMessage = (errorMessage: string) => {
  const errorCodeMessage = errorMessage.substring(0, errorMessage.indexOf("-") + 1);
  const innerErrorCue = "{\\'error\\': {\\'message\\': ";
  if (errorMessage.includes(innerErrorCue)) {
    try {
      let innerErrorString = errorMessage.substring(errorMessage.indexOf(innerErrorCue));
      if (innerErrorString.endsWith("'}}")) {
        innerErrorString = innerErrorString.substring(0, innerErrorString.length - 3);
      }
      innerErrorString = innerErrorString.replaceAll("\\'", "'");
      const newErrorMessage = errorCodeMessage + " " + innerErrorString;
      errorMessage = newErrorMessage;
    } catch (e) {
      console.error("Error parsing inner error message: ", e);
    }
  }

  return tryGetRaiPrettyError(errorMessage);
};

export const getQuestionContent = (question: ChatMessage["content"]) => {
  return typeof question === "string"
    ? question
    : [
        { type: "text", text: question[0].text },
        { type: "image_url", image_url: { url: question[1].image_url.url } }
      ];
};

export const generateUserMessage = (question: ChatMessage["content"]): ChatMessage => {
  return {
    id: uuid(),
    role: "user",
    content: getQuestionContent(question) as string,
    date: new Date().toISOString()
  };
};
