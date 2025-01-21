import ReactMarkdown from "react-markdown";
import DOMPurify from "dompurify";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

import { Citation } from "../../api/models";
import { XSSAllowTags } from "../../constants/sanatizeAllowables";
import SidePanel from "../SidePanel/SidePanel";

import styles from "./CitationPanel.module.css";

interface CitationPanelProps {
  show: boolean;
  activeCitation?: Citation;
  onClose: () => void;
  onViewSource: (citation: Citation) => void;
}

const CitationPanel = ({ show, activeCitation, onClose, onViewSource }: CitationPanelProps) => {
  if (!show || !activeCitation) return null;

  return (
    <SidePanel title="Citations" onClose={onClose}>
      <a
        tabIndex={0}
        role="button"
        className={styles.citationPanelTitle}
        title={
          activeCitation.url && !activeCitation.url.includes("blob.core")
            ? activeCitation.url
            : activeCitation.title ?? ""
        }
        onClick={() => onViewSource(activeCitation)}>
        {activeCitation.title} test
      </a>
      <div>
        <ReactMarkdown
          linkTarget="_blank"
          className={styles.citationPanelContent}
          children={DOMPurify.sanitize(activeCitation.content, {
            ALLOWED_TAGS: XSSAllowTags
          })}
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
        />
      </div>
    </SidePanel>
  );
};

export default CitationPanel;
