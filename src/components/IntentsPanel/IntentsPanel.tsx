import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { nord } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Stack } from "@fluentui/react";

import { ExecResults } from "../../api/models";
import SidePanel from "../SidePanel/SidePanel";

import styles from "./IntentsPanel.module.css";

interface IntentsPanelProps {
  show: boolean;
  answerExecResult?: ExecResults[];
  onClose: () => void;
}

const IntentsPanel = ({ show, answerExecResult, onClose }: IntentsPanelProps) => {
  if (!show) return null;

  const syntaxHighlighter = (content: string, language: "sql" | "python") => {
    return (
      <SyntaxHighlighter
        style={nord}
        wrapLines={true}
        lineProps={{
          style: {
            wordBreak: "break-all",
            whiteSpace: "pre-wrap"
          }
        }}
        language={language}
        PreTag="p">
        {content}
      </SyntaxHighlighter>
    );
  };

  return (
    <SidePanel title="Intents" onClose={onClose}>
      <Stack horizontalAlign="space-between">
        {answerExecResult?.map((execResult: ExecResults, index) => {
          const { intent, search_query, search_result, code_generated } = execResult;
          return (
            <Stack className={styles.exectResultList} verticalAlign="space-between" key={index}>
              <span>Intent: </span> <p>{intent}</p>
              {search_query && (
                <>
                  <span>Search Query:</span>
                  {syntaxHighlighter(search_query, "sql")}
                </>
              )}
              {search_result && (
                <>
                  <span>Search Result: </span>
                  <p>{search_result}</p>
                </>
              )}
              {code_generated && (
                <>
                  <span>Code Generated:</span>
                  {syntaxHighlighter(code_generated, "python")}
                </>
              )}
            </Stack>
          );
        })}
      </Stack>
    </SidePanel>
  );
};

export default IntentsPanel;
