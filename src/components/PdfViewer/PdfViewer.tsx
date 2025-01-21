import { ScrollMode, SpecialZoomLevel } from "@react-pdf-viewer/core";
import { Worker } from "@react-pdf-viewer/core";
import { Viewer } from "@react-pdf-viewer/core";
import { searchPlugin } from "@react-pdf-viewer/search";
import { toolbarPlugin } from "@react-pdf-viewer/toolbar";

import Toolbar from "./Toolbar";

// Import the styles
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/toolbar/lib/styles/index.css";
import "@react-pdf-viewer/search/lib/styles/index.css";
import styles from "./PdfViewer.module.css";

const workerUrl = "https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js";

interface PdfViewerProps {
  pdfUrl: string;
  initialPage?: number;
  highlightedText?: string[];
}

const PdfViewer = ({ pdfUrl, initialPage, highlightedText = [] }: PdfViewerProps) => {
  const toolbarPluginInstance = toolbarPlugin();

  const searchPluginInstance = searchPlugin({
    keyword: highlightedText
  });

  return (
    <div className={`${styles.pdfViewer} pdf-viewer`}>
      <Worker workerUrl={workerUrl}>
        <Toolbar pluginInstance={toolbarPluginInstance} />
        <div style={{ overflow: "hidden" }}>
          <Viewer
            fileUrl={pdfUrl}
            scrollMode={ScrollMode.Vertical}
            plugins={[toolbarPluginInstance, searchPluginInstance]}
            initialPage={initialPage ?? 0}
            defaultScale={SpecialZoomLevel.PageWidth}
          />
        </div>
      </Worker>
    </div>
  );
};

export default PdfViewer;
