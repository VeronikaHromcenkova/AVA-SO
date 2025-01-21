import { useState } from "react";
import { ChevronDown16Regular as ChevronDown, ChevronUp16Regular as ChevronUp } from "@fluentui/react-icons";
import { MinimalButton, Position, Tooltip } from "@react-pdf-viewer/core";
import { RenderSearchProps } from "@react-pdf-viewer/search";

import styles from "./PdfViewer.module.css";

const SearchInput = (props: RenderSearchProps) => {
  const [readyToSearch, setReadyToSearch] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReadyToSearch(false);
    props.setKeyword(e.target.value);
    if (e.target.value.length === 0) props.clearKeyword();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && props.keyword) {
      setReadyToSearch(true);
      props.search();
    }
  };

  return (
    <>
      <div className={styles.search}>
        <input
          className={styles.searchInput}
          placeholder="Enter to search"
          type="text"
          value={props.keyword}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
        />
        <div className={styles.inline}>
          {readyToSearch && props.keyword && (
            <div style={{ padding: "0 8px" }}>
              {props.currentMatch}/{props.numberOfMatches}
            </div>
          )}
          <div className={styles.divider} />
          <div>
            <Tooltip
              position={Position.BottomCenter}
              target={
                <MinimalButton onClick={props.jumpToPreviousMatch} isDisabled={props.numberOfMatches === 0}>
                  <ChevronUp />
                </MinimalButton>
              }
              content={() => "Previous match"}
              offset={{ left: 0, top: 8 }}
            />
          </div>
          <div>
            <Tooltip
              position={Position.BottomCenter}
              target={
                <MinimalButton onClick={props.jumpToNextMatch} isDisabled={props.numberOfMatches === 0}>
                  <ChevronDown />
                </MinimalButton>
              }
              content={() => "Next match"}
              offset={{ left: 0, top: 8 }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchInput;
