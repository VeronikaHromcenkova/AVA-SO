import { useContext, useEffect, useRef, useState } from "react";
import {
  css,
  DefaultButton,
  Dialog,
  DialogFooter,
  DialogType,
  IconButton,
  ITextField,
  PrimaryButton,
  Stack,
  Text,
  TextField
} from "@fluentui/react";
import { useBoolean } from "@fluentui/react-hooks";

import { historyDelete, historyRename } from "../../../api";
import { Conversation } from "../../../api/models";
import { AppStateContext } from "../../../state/AppProvider";

import styles from "../ChatHistory.module.css";

interface ChatHistoryListItemProps {
  item?: Conversation;
  onSelect: (item: Conversation | null) => void;
}

const dialogContentProps = {
  type: DialogType.close,
  title: "Are you sure you want to delete this item?",
  closeButtonAriaLabel: "Close",
  subText: "The history of this chat session will permanently removed."
};

const modalProps = {
  titleAriaId: "labelId",
  subtitleAriaId: "subTextId",
  isBlocking: true,
  styles: { main: { maxWidth: 450 } }
};

export const ChatHistoryListItem: React.FC<ChatHistoryListItemProps> = ({ item, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [edit, setEdit] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [hideDeleteDialog, { toggle: toggleDeleteDialog }] = useBoolean(true);
  const [errorDelete, setErrorDelete] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);
  const [errorRename, setErrorRename] = useState<string | undefined>(undefined);
  const [textFieldFocused, setTextFieldFocused] = useState(false);
  const textFieldRef = useRef<ITextField | null>(null);

  const appStateContext = useContext(AppStateContext);
  const isSelected = item?.id === appStateContext?.state.currentChat?.id;

  useEffect(() => {
    if (textFieldFocused && textFieldRef.current) {
      textFieldRef.current.focus();
      setTextFieldFocused(false);
    }
  }, [textFieldFocused]);

  useEffect(() => {
    if (appStateContext?.state.currentChat?.id !== item?.id) {
      setEdit(false);
      setEditTitle("");
    }
  }, [appStateContext?.state.currentChat?.id, item?.id]);

  if (!item) {
    return null;
  }

  const onDelete = async () => {
    const response = await historyDelete(item.id);
    if (!response.ok) {
      setErrorDelete(true);
      setTimeout(() => {
        setErrorDelete(false);
      }, 5000);
    } else {
      appStateContext?.dispatch({ type: "DELETE_CHAT_ENTRY", payload: item.id });
    }
    toggleDeleteDialog();
  };

  const onEdit = () => {
    setEdit(true);
    setTextFieldFocused(true);
    setEditTitle(item?.title);
  };

  const handleSelectItem = () => {
    onSelect(item);
    appStateContext?.dispatch({ type: "UPDATE_CURRENT_CHAT", payload: item });
  };

  const truncatedTitle = item?.title?.length > 28 ? `${item.title.substring(0, 28)} ...` : item.title.toString();

  const handleSaveEdit = async (e: any) => {
    e.preventDefault();
    if (errorRename || renameLoading) {
      return;
    }
    if (editTitle == item.title) {
      setErrorRename("Error: Enter a new title to proceed.");
      setTimeout(() => {
        setErrorRename(undefined);
        setTextFieldFocused(true);
        if (textFieldRef.current) {
          textFieldRef.current.focus();
        }
      }, 5000);
      return;
    }
    setRenameLoading(true);
    const response = await historyRename(item.id, editTitle);
    if (!response.ok) {
      setErrorRename("Error: could not rename item");
      setTimeout(() => {
        setTextFieldFocused(true);
        setErrorRename(undefined);
        if (textFieldRef.current) {
          textFieldRef.current.focus();
        }
      }, 5000);
    } else {
      setRenameLoading(false);
      setEdit(false);
      appStateContext?.dispatch({ type: "UPDATE_CHAT_TITLE", payload: { ...item, title: editTitle } as Conversation });
      setEditTitle("");
    }
  };

  const chatHistoryTitleOnChange = (e: any) => {
    setEditTitle(e.target.value);
  };

  const cancelEditTitle = () => {
    setEdit(false);
    setEditTitle("");
  };

  const handleKeyPressEdit = (e: any) => {
    if (e.key === "Enter") {
      return handleSaveEdit(e);
    }
    if (e.key === "Escape") {
      cancelEditTitle();
      return;
    }
  };

  return (
    <Stack
      key={item.id}
      aria-label="chat history item"
      className={styles.itemCell}
      verticalAlign="center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      styles={{
        root: {
          backgroundColor: isSelected ? "#e6e6e6" : "transparent"
        }
      }}>
      {edit ? (
        <Stack.Item style={{ width: "100%" }}>
          <form aria-label="edit title form" onSubmit={e => handleSaveEdit(e)}>
            <Stack horizontal verticalAlign={"start"}>
              <TextField
                componentRef={textFieldRef}
                value={editTitle}
                placeholder={item.title}
                onChange={chatHistoryTitleOnChange}
                onKeyDown={handleKeyPressEdit}
                disabled={errorRename ? true : false}
                styles={{
                  fieldGroup: {
                    height: "28px"
                  },
                  field: {
                    backgroundColor: "transparent"
                  }
                }}
              />
              {editTitle && (
                <Stack aria-label="action button group" horizontal verticalAlign={"center"}>
                  <IconButton
                    role="button"
                    className={styles.itemButton}
                    disabled={errorRename !== undefined}
                    onKeyDown={e => (e.key === " " || e.key === "Enter" ? handleSaveEdit(e) : null)}
                    onClick={e => handleSaveEdit(e)}
                    aria-label="confirm new title"
                    iconProps={{ iconName: "CheckMark" }}
                  />
                  <IconButton
                    role="button"
                    className={css(styles.itemButton, styles.errorColor)}
                    disabled={errorRename !== undefined}
                    onKeyDown={e => (e.key === " " || e.key === "Enter" ? cancelEditTitle() : null)}
                    onClick={() => cancelEditTitle()}
                    aria-label="cancel edit title"
                    iconProps={{ iconName: "Cancel" }}
                  />
                </Stack>
              )}
            </Stack>
          </form>
        </Stack.Item>
      ) : (
        <Stack horizontal verticalAlign={"center"} style={{ width: "100%" }}>
          <div
            className={styles.chatTitle}
            onClick={handleSelectItem}
            onKeyDown={e => (e.key === "Enter" || e.key === " " ? handleSelectItem() : null)}
            role="button"
            tabIndex={0}>
            {truncatedTitle}
          </div>
          {(isSelected || isHovered) && (
            <Stack horizontal horizontalAlign="end">
              <IconButton
                className={styles.itemButton}
                iconProps={{ iconName: "Delete" }}
                title="Delete"
                onClick={toggleDeleteDialog}
                onKeyDown={e => (e.key === " " ? toggleDeleteDialog() : null)}
              />
              <IconButton
                className={styles.itemButton}
                iconProps={{ iconName: "Edit" }}
                title="Edit"
                onClick={onEdit}
                onKeyDown={e => (e.key === " " ? onEdit() : null)}
              />
            </Stack>
          )}
        </Stack>
      )}
      {(errorDelete || errorRename) && (
        <Text role="alert" style={{ fontSize: 12, fontWeight: 400, color: "rgb(164,38,44)" }}>
          {errorRename ?? "Error: could not delete item"}
        </Text>
      )}
      <Dialog
        hidden={hideDeleteDialog}
        onDismiss={toggleDeleteDialog}
        dialogContentProps={dialogContentProps}
        modalProps={modalProps}>
        <DialogFooter>
          <PrimaryButton onClick={onDelete} text="Delete" />
          <DefaultButton onClick={toggleDeleteDialog} text="Cancel" />
        </DialogFooter>
      </Dialog>
    </Stack>
  );
};
