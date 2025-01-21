import { useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import uuid from "react-uuid";
import { DialogType } from "@fluentui/react";
import { useBoolean } from "@fluentui/react-hooks";
import { isEmpty } from "lodash";

import { generateUserMessage, parseErrorMessage } from "../utils/messages";

import {
  AzureSqlServerExecResults,
  ChatHistoryLoadingState,
  ChatMessage,
  ChatResponse,
  Citation,
  Conversation,
  conversationApi,
  ConversationRequest,
  CosmosDBStatus,
  ErrorMessage,
  ExecResults,
  historyClear,
  historyGenerate,
  historyUpdate
} from "./../api";
import { AppStateContext } from "./../state/AppProvider";

const enum messageStatus {
  NotRunning = "Not Running",
  Processing = "Processing",
  Done = "Done"
}

const useChat = () => {
  const appStateContext = useContext(AppStateContext);
  const chatMessageStreamEnd = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showLoadingMessage, setShowLoadingMessage] = useState<boolean>(false);
  const [activeCitation, setActiveCitation] = useState<Citation>();
  const [isCitationPanelOpen, setIsCitationPanelOpen] = useState<boolean>(false);
  const [isIntentsPanelOpen, setIsIntentsPanelOpen] = useState<boolean>(false);
  const abortFuncs = useRef([] as AbortController[]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [execResults, setExecResults] = useState<ExecResults[]>([]);
  const [processMessages, setProcessMessages] = useState<messageStatus>(messageStatus.NotRunning);
  const [clearingChat, setClearingChat] = useState<boolean>(false);
  const [hideErrorDialog, { toggle: toggleErrorDialog }] = useBoolean(true);
  const [errorMsg, setErrorMsg] = useState<ErrorMessage | null>();
  const [answerId, setAnswerId] = useState<string>("");

  const errorDialogContentProps = {
    type: DialogType.close,
    title: errorMsg?.title,
    closeButtonAriaLabel: "Close",
    subText: errorMsg?.subtitle
  };

  const modalProps = {
    titleAriaId: "labelId",
    subtitleAriaId: "subTextId",
    isBlocking: true,
    styles: { main: { maxWidth: 450 } }
  };

  const [ASSISTANT, TOOL, ERROR] = ["assistant", "tool", "error"];
  const NO_CONTENT_ERROR = "No content in messages object.";

  useEffect(() => {
    if (
      appStateContext?.state.isCosmosDBAvailable?.status !== CosmosDBStatus.Working &&
      appStateContext?.state.isCosmosDBAvailable?.status !== CosmosDBStatus.NotConfigured &&
      appStateContext?.state.chatHistoryLoadingState === ChatHistoryLoadingState.Fail &&
      hideErrorDialog
    ) {
      const subtitle = `${appStateContext.state.isCosmosDBAvailable.status}. Please contact the site administrator.`;
      setErrorMsg({
        title: "Chat history is not enabled",
        subtitle: subtitle
      });
      toggleErrorDialog();
    }
  }, [appStateContext?.state.isCosmosDBAvailable]);

  const handleErrorDialogClose = () => {
    toggleErrorDialog();
    setTimeout(() => {
      setErrorMsg(null);
    }, 500);
  };

  useEffect(() => {
    setIsLoading(appStateContext?.state.chatHistoryLoadingState === ChatHistoryLoadingState.Loading);
  }, [appStateContext?.state.chatHistoryLoadingState]);

  let assistantMessage = {} as ChatMessage;
  let toolMessage = {} as ChatMessage;
  let assistantContent = "";

  useEffect(() => parseExecResults(execResults), [execResults]);

  const parseExecResults = (exec_results_: any): void => {
    if (exec_results_ == undefined) return;
    const exec_results = exec_results_.length === 2 ? exec_results_ : exec_results_.splice(2);
    appStateContext?.dispatch({
      type: "SET_ANSWER_EXEC_RESULT",
      payload: { answerId: answerId, exec_result: exec_results }
    });
  };

  const processResultMessage = (resultMessage: ChatMessage, userMessage: ChatMessage, conversationId?: string) => {
    if (typeof resultMessage.content === "string" && resultMessage.content.includes("all_exec_results")) {
      const parsedExecResults = JSON.parse(resultMessage.content) as AzureSqlServerExecResults;
      setExecResults(parsedExecResults.all_exec_results);
      assistantMessage.context = JSON.stringify({
        all_exec_results: parsedExecResults.all_exec_results
      });
    }

    if (resultMessage.role === ASSISTANT) {
      setAnswerId(resultMessage.id);
      assistantContent += resultMessage.content;
      assistantMessage = { ...assistantMessage, ...resultMessage };
      assistantMessage.content = assistantContent;

      if (resultMessage.context) {
        toolMessage = {
          id: uuid(),
          role: TOOL,
          content: resultMessage.context,
          date: new Date().toISOString()
        };
      }
    }

    if (resultMessage.role === TOOL) toolMessage = resultMessage;

    if (!conversationId) {
      isEmpty(toolMessage)
        ? setMessages([...messages, userMessage, assistantMessage])
        : setMessages([...messages, userMessage, toolMessage, assistantMessage]);
    } else {
      isEmpty(toolMessage)
        ? setMessages([...messages, assistantMessage])
        : setMessages([...messages, toolMessage, assistantMessage]);
    }
  };

  const sendMessage = (question: ChatMessage["content"], conversationId?: string) => {
    appStateContext?.state.isCosmosDBAvailable?.cosmosDB
      ? makeApiRequestWithCosmosDB(question, conversationId)
      : makeApiRequestWithoutCosmosDB(question, conversationId);
  };

  const makeApiRequestWithoutCosmosDB = async (question: ChatMessage["content"], conversationId?: string) => {
    setIsLoading(true);
    setShowLoadingMessage(true);
    const abortController = new AbortController();
    abortFuncs.current.unshift(abortController);

    const userMessage = generateUserMessage(question);
    question = typeof question !== "string" && question[0]?.text?.length > 0 ? question[0].text : question;

    let conversation: Conversation | null | undefined;
    if (!conversationId) {
      conversation = {
        id: conversationId ?? uuid(),
        title: question as string,
        messages: [userMessage],
        date: new Date().toISOString()
      };
    } else {
      conversation = appStateContext?.state?.currentChat;
      if (!conversation) {
        console.error("Conversation not found.");
        setIsLoading(false);
        setShowLoadingMessage(false);
        abortFuncs.current = abortFuncs.current.filter(a => a !== abortController);
        return;
      } else {
        conversation.messages.push(userMessage);
      }
    }

    appStateContext?.dispatch({ type: "UPDATE_CURRENT_CHAT", payload: conversation });
    setMessages(conversation.messages);

    const request: ConversationRequest = {
      messages: [...conversation.messages.filter(answer => answer.role !== ERROR)]
    };

    let result = {} as ChatResponse;
    try {
      const response = await conversationApi(request, abortController.signal);
      if (response?.body) {
        const reader = response.body.getReader();

        let runningText = "";
        while (true) {
          setProcessMessages(messageStatus.Processing);
          const { done, value } = await reader.read();
          if (done) break;

          const text = new TextDecoder("utf-8").decode(value);
          const objects = text.split("\n");
          objects.forEach(obj => {
            try {
              if (obj !== "" && obj !== "{}") {
                runningText += obj;
                result = JSON.parse(runningText);
                if (result.choices?.length > 0) {
                  result.choices[0].messages.forEach(msg => {
                    msg.id = result.id;
                    msg.date = new Date().toISOString();
                  });
                  if (result.choices[0].messages?.some(m => m.role === ASSISTANT)) {
                    setShowLoadingMessage(false);
                  }
                  result.choices[0].messages.forEach(resultObj => {
                    processResultMessage(resultObj, userMessage, conversationId);
                  });
                } else if (result.error) {
                  throw Error(result.error);
                }
                runningText = "";
              }
            } catch (e) {
              if (!(e instanceof SyntaxError)) {
                console.error(e);
                throw e;
              } else {
                console.log("Incomplete message. Continuing...");
              }
            }
          });
        }
        conversation.messages.push(toolMessage, assistantMessage);
        appStateContext?.dispatch({ type: "UPDATE_CURRENT_CHAT", payload: conversation });
        setMessages([...messages, toolMessage, assistantMessage]);
      }
    } catch (e) {
      if (!abortController.signal.aborted) {
        let errorMessage =
          "An error occurred. Please try again. If the problem persists, please contact the site administrator.";
        if (result.error?.message) {
          errorMessage = result.error.message;
        } else if (typeof result.error === "string") {
          errorMessage = result.error;
        }

        errorMessage = parseErrorMessage(errorMessage);

        const errorChatMsg: ChatMessage = {
          id: uuid(),
          role: ERROR,
          content: errorMessage,
          date: new Date().toISOString()
        };
        conversation.messages.push(errorChatMsg);
        appStateContext?.dispatch({ type: "UPDATE_CURRENT_CHAT", payload: conversation });
        setMessages([...messages, errorChatMsg]);
      } else {
        setMessages([...messages, userMessage]);
      }
    } finally {
      setIsLoading(false);
      setShowLoadingMessage(false);
      abortFuncs.current = abortFuncs.current.filter(a => a !== abortController);
      setProcessMessages(messageStatus.Done);
    }

    return abortController.abort();
  };

  const makeApiRequestWithCosmosDB = async (question: ChatMessage["content"], conversationId?: string) => {
    setIsLoading(true);
    setShowLoadingMessage(true);
    const abortController = new AbortController();
    abortFuncs.current.unshift(abortController);
    const userMessage = generateUserMessage(question);
    question = typeof question !== "string" && question[0]?.text?.length > 0 ? question[0].text : question;

    let request: ConversationRequest;
    let conversation;
    if (conversationId) {
      conversation = appStateContext?.state?.chatHistory?.find(conv => conv.id === conversationId);
      if (!conversation) {
        console.error("Conversation not found.");
        setIsLoading(false);
        setShowLoadingMessage(false);
        abortFuncs.current = abortFuncs.current.filter(a => a !== abortController);
        return;
      } else {
        conversation.messages.push(userMessage);
        request = {
          messages: [...conversation.messages.filter(answer => answer.role !== ERROR)]
        };
      }
    } else {
      request = {
        messages: [userMessage].filter(answer => answer.role !== ERROR)
      };
      setMessages(request.messages);
    }
    let result = {} as ChatResponse;
    let errorResponseMessage = "Please try again. If the problem persists, please contact the site administrator.";
    try {
      const response = conversationId
        ? await historyGenerate(request, abortController.signal, conversationId)
        : await historyGenerate(request, abortController.signal);
      if (!response?.ok) {
        const responseJson = await response.json();
        errorResponseMessage =
          responseJson.error === undefined ? errorResponseMessage : parseErrorMessage(responseJson.error);
        const errorChatMsg: ChatMessage = {
          id: uuid(),
          role: ERROR,
          content: `There was an error generating a response. Chat history can't be saved at this time. ${errorResponseMessage}`,
          date: new Date().toISOString()
        };
        let resultConversation;
        if (conversationId) {
          resultConversation = appStateContext?.state?.chatHistory?.find(conv => conv.id === conversationId);
          if (!resultConversation) {
            console.error("Conversation not found.");
            setIsLoading(false);
            setShowLoadingMessage(false);
            abortFuncs.current = abortFuncs.current.filter(a => a !== abortController);
            return;
          }
          resultConversation.messages.push(errorChatMsg);
        } else {
          setMessages([...messages, userMessage, errorChatMsg]);
          setIsLoading(false);
          setShowLoadingMessage(false);
          abortFuncs.current = abortFuncs.current.filter(a => a !== abortController);
          return;
        }
        appStateContext?.dispatch({ type: "UPDATE_CURRENT_CHAT", payload: resultConversation });
        setMessages([...resultConversation.messages]);
        return;
      }
      if (response?.body) {
        const reader = response.body.getReader();

        let runningText = "";
        while (true) {
          setProcessMessages(messageStatus.Processing);
          const { done, value } = await reader.read();
          if (done) break;

          const text = new TextDecoder("utf-8").decode(value);
          const objects = text.split("\n");
          objects.forEach(obj => {
            try {
              if (obj !== "" && obj !== "{}") {
                runningText += obj;
                result = JSON.parse(runningText);
                if (!result.choices?.[0]?.messages?.[0].content) {
                  errorResponseMessage = NO_CONTENT_ERROR;
                  throw Error();
                }
                if (result.choices?.length > 0) {
                  result.choices[0].messages.forEach(msg => {
                    msg.id = result.id;
                    msg.date = new Date().toISOString();
                  });
                  if (result.choices[0].messages?.some(m => m.role === ASSISTANT)) {
                    setShowLoadingMessage(false);
                  }
                  result.choices[0].messages.forEach(resultObj => {
                    processResultMessage(resultObj, userMessage, conversationId);
                  });
                }
                runningText = "";
              } else if (result.error) {
                throw Error(result.error);
              }
            } catch (e) {
              if (!(e instanceof SyntaxError)) {
                console.error(e);
                throw e;
              } else {
                console.log("Incomplete message. Continuing...");
              }
            }
          });
        }

        let resultConversation;
        if (conversationId) {
          resultConversation = appStateContext?.state?.chatHistory?.find(conv => conv.id === conversationId);
          if (!resultConversation) {
            console.error("Conversation not found.");
            setIsLoading(false);
            setShowLoadingMessage(false);
            abortFuncs.current = abortFuncs.current.filter(a => a !== abortController);
            return;
          }
          isEmpty(toolMessage)
            ? resultConversation.messages.push(assistantMessage)
            : resultConversation.messages.push(toolMessage, assistantMessage);
        } else {
          resultConversation = {
            id: result.history_metadata.conversation_id,
            title: result.history_metadata.title,
            messages: [userMessage],
            date: result.history_metadata.date
          };
          isEmpty(toolMessage)
            ? resultConversation.messages.push(assistantMessage)
            : resultConversation.messages.push(toolMessage, assistantMessage);
        }
        if (!resultConversation) {
          setIsLoading(false);
          setShowLoadingMessage(false);
          abortFuncs.current = abortFuncs.current.filter(a => a !== abortController);
          return;
        }
        appStateContext?.dispatch({ type: "UPDATE_CURRENT_CHAT", payload: resultConversation });
        isEmpty(toolMessage)
          ? setMessages([...messages, assistantMessage])
          : setMessages([...messages, toolMessage, assistantMessage]);
      }
    } catch (e) {
      if (!abortController.signal.aborted) {
        let errorMessage = `An error occurred. ${errorResponseMessage}`;
        if (result.error?.message) {
          errorMessage = result.error.message;
        } else if (typeof result.error === "string") {
          errorMessage = result.error;
        }

        errorMessage = parseErrorMessage(errorMessage);

        const errorChatMsg: ChatMessage = {
          id: uuid(),
          role: ERROR,
          content: errorMessage,
          date: new Date().toISOString()
        };
        let resultConversation;
        if (conversationId) {
          resultConversation = appStateContext?.state?.chatHistory?.find(conv => conv.id === conversationId);
          if (!resultConversation) {
            console.error("Conversation not found.");
            setIsLoading(false);
            setShowLoadingMessage(false);
            abortFuncs.current = abortFuncs.current.filter(a => a !== abortController);
            return;
          }
          resultConversation.messages.push(errorChatMsg);
        } else {
          if (!result.history_metadata) {
            console.error("Error retrieving data.", result);
            const errorChatMsg: ChatMessage = {
              id: uuid(),
              role: ERROR,
              content: errorMessage,
              date: new Date().toISOString()
            };
            setMessages([...messages, userMessage, errorChatMsg]);
            setIsLoading(false);
            setShowLoadingMessage(false);
            abortFuncs.current = abortFuncs.current.filter(a => a !== abortController);
            return;
          }
          resultConversation = {
            id: result.history_metadata.conversation_id,
            title: result.history_metadata.title,
            messages: [userMessage],
            date: result.history_metadata.date
          };
          resultConversation.messages.push(errorChatMsg);
        }
        if (!resultConversation) {
          setIsLoading(false);
          setShowLoadingMessage(false);
          abortFuncs.current = abortFuncs.current.filter(a => a !== abortController);
          return;
        }
        appStateContext?.dispatch({ type: "UPDATE_CURRENT_CHAT", payload: resultConversation });
        setMessages([...messages, errorChatMsg]);
      } else {
        setMessages([...messages, userMessage]);
      }
    } finally {
      setIsLoading(false);
      setShowLoadingMessage(false);
      abortFuncs.current = abortFuncs.current.filter(a => a !== abortController);
      setProcessMessages(messageStatus.Done);
    }
    return abortController.abort();
  };

  const clearChat = async () => {
    setClearingChat(true);
    if (appStateContext?.state.currentChat?.id && appStateContext?.state.isCosmosDBAvailable.cosmosDB) {
      const response = await historyClear(appStateContext?.state.currentChat.id);
      if (!response.ok) {
        setErrorMsg({
          title: "Error clearing current chat",
          subtitle: "Please try again. If the problem persists, please contact the site administrator."
        });
        toggleErrorDialog();
      } else {
        appStateContext?.dispatch({
          type: "DELETE_CURRENT_CHAT_MESSAGES",
          payload: appStateContext?.state.currentChat.id
        });
        appStateContext?.dispatch({ type: "UPDATE_CHAT_HISTORY", payload: appStateContext?.state.currentChat });
        setActiveCitation(undefined);
        setIsCitationPanelOpen(false);
        setIsIntentsPanelOpen(false);
        setMessages([]);
      }
    }
    setClearingChat(false);
  };

  const newChat = () => {
    setProcessMessages(messageStatus.Processing);
    setMessages([]);
    setIsCitationPanelOpen(false);
    setIsIntentsPanelOpen(false);
    setActiveCitation(undefined);
    appStateContext?.dispatch({ type: "UPDATE_CURRENT_CHAT", payload: null });
    setProcessMessages(messageStatus.Done);
  };

  const stopGenerating = () => {
    abortFuncs.current.forEach(a => a.abort());
    setShowLoadingMessage(false);
    setIsLoading(false);
  };

  useEffect(() => {
    if (appStateContext?.state.currentChat) {
      setMessages(appStateContext.state.currentChat.messages);
    } else {
      setMessages([]);
    }
  }, [appStateContext?.state.currentChat]);

  useLayoutEffect(() => {
    const saveToDB = async (messages: ChatMessage[], id: string) => {
      const response = await historyUpdate(messages, id);
      return response;
    };

    if (appStateContext && appStateContext.state.currentChat && processMessages === messageStatus.Done) {
      if (appStateContext.state.isCosmosDBAvailable.cosmosDB) {
        if (!appStateContext?.state.currentChat?.messages) {
          console.error("Failure fetching current chat state.");
          return;
        }
        const noContentError = appStateContext.state.currentChat.messages.find(m => m.role === ERROR);

        if (!noContentError) {
          saveToDB(appStateContext.state.currentChat.messages, appStateContext.state.currentChat.id)
            .then(res => {
              if (!res.ok) {
                const errorMessage =
                  "An error occurred. Answers can't be saved at this time. If the problem persists, please contact the site administrator.";
                const errorChatMsg: ChatMessage = {
                  id: uuid(),
                  role: ERROR,
                  content: errorMessage,
                  date: new Date().toISOString()
                };
                if (!appStateContext?.state.currentChat?.messages) {
                  const err: Error = {
                    ...new Error(),
                    message: "Failure fetching current chat state."
                  };
                  throw err;
                }
                setMessages([...appStateContext?.state.currentChat?.messages, errorChatMsg]);
              }
              return res as Response;
            })
            .catch(err => {
              console.error("Error: ", err);
              const errRes: Response = {
                ...new Response(),
                ok: false,
                status: 500
              };
              return errRes;
            });
        }
      } else {
      }
      appStateContext?.dispatch({ type: "UPDATE_CHAT_HISTORY", payload: appStateContext.state.currentChat });
      setMessages(appStateContext.state.currentChat.messages);
      setProcessMessages(messageStatus.NotRunning);
    }
  }, [processMessages]);

  useLayoutEffect(() => {
    chatMessageStreamEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [showLoadingMessage, processMessages]);

  const onShowCitation = (citation: Citation) => {
    setActiveCitation(citation);
    setIsCitationPanelOpen(true);
  };

  const onShowExecResult = (answerId: string) => {
    setIsIntentsPanelOpen(true);
  };

  const onViewSource = (citation: Citation) => {
    if (citation.url && !citation.url.includes("blob.core")) {
      window.open(citation.url, "_blank");
    }
  };

  const disabledButton = () => {
    return (
      isLoading ||
      (messages && messages.length === 0) ||
      clearingChat ||
      appStateContext?.state.chatHistoryLoadingState === ChatHistoryLoadingState.Loading
    );
  };

  return {
    messages,
    execResults,
    processMessages,
    showLoadingMessage,
    isLoading,
    activeCitation,
    isCitationPanelOpen,
    isIntentsPanelOpen,
    chatMessageStreamEnd,
    hideErrorDialog,
    modalProps,
    errorDialogContentProps,
    answerId,
    ERROR,
    makeApiRequestWithoutCosmosDB,
    makeApiRequestWithCosmosDB,
    clearChat,
    newChat,
    stopGenerating,
    onShowCitation,
    onViewSource,
    disabledButton,
    onShowExecResult,
    handleErrorDialogClose,
    setIsCitationPanelOpen,
    setIsIntentsPanelOpen,
    sendMessage
  };
};

export default useChat;
