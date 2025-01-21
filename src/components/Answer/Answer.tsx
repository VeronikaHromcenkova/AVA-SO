import { useContext, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { nord } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Stack } from "@fluentui/react";
import DOMPurify from "dompurify";
import remarkGfm from "remark-gfm";
import supersub from "remark-supersub";

import { AskResponse, Citation } from "../../api";
import { XSSAllowAttributes, XSSAllowTags } from "../../constants/sanatizeAllowables";
import { AppStateContext } from "../../state/AppProvider";

import AnswerFooter from "./components/AnswerFooter";
import AnswerHeader from "./components/AnswerHeader";
import GeneratedChart from "./components/Chart";
import { parseAnswer } from "./AnswerParser";

import styles from "./Answer.module.css";

interface Props {
  answer: AskResponse;
  onCitationClicked: (citedDocument: Citation) => void;
  onExectResultClicked: (answerId: string) => void;
}

export const Answer = ({ answer, onCitationClicked, onExectResultClicked }: Props) => {
  const parsedAnswer = useMemo(() => parseAnswer(answer), [answer]);
  const appStateContext = useContext(AppStateContext);
  const SANITIZE_ANSWER = appStateContext?.state.frontendSettings?.sanitize_answer;

  const components = {
    code({ node, ...props }: { node: any; [key: string]: any }) {
      let language;
      if (props.className) {
        const match = props.className.match(/language-(\w+)/);
        language = match ? match[1] : undefined;
      }
      const codeString = node.children[0].value ?? "";
      return (
        <SyntaxHighlighter style={nord} language={language} PreTag="div" {...props}>
          {codeString}
        </SyntaxHighlighter>
      );
    }
  };

  return (
    <>
      <Stack className={styles.answerContainer} tabIndex={0}>
        <Stack.Item>
          <Stack horizontal grow>
            <Stack.Item grow>
              {parsedAnswer && (
                <ReactMarkdown
                  linkTarget="_blank"
                  remarkPlugins={[remarkGfm, supersub]}
                  children={
                    SANITIZE_ANSWER
                      ? DOMPurify.sanitize(parsedAnswer?.markdownFormatText, {
                          ALLOWED_TAGS: XSSAllowTags,
                          ALLOWED_ATTR: XSSAllowAttributes
                        })
                      : parsedAnswer?.markdownFormatText
                  }
                  className={styles.answerText}
                  components={components}
                />
              )}
            </Stack.Item>
            <AnswerHeader answer={answer} />
          </Stack>
        </Stack.Item>

        <GeneratedChart generated_chart={parsedAnswer?.generated_chart} />

        {/* <AnswerFooter
          citations={parsedAnswer?.citations}
          exec_results={answer.exec_results}
          onExectResultClicked={() => onExectResultClicked(answer.message_id ?? "")}
          onCitationClicked={onCitationClicked}
        /> */}
      </Stack>
    </>
  );
};
