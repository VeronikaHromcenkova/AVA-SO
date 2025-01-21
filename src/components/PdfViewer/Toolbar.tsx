import {
  AddRegular as PlusIcon,
  ArrowClockwiseRegular as ResetIcon,
  ArrowDownloadRegular as DownloadIcon,
  SubtractRegular as MinusIcon
} from "@fluentui/react-icons";
import { Position, SpecialZoomLevel, Tooltip } from "@react-pdf-viewer/core";
import { ToolbarPlugin, ToolbarSlot } from "@react-pdf-viewer/toolbar";

import SearchInput from "./SearchInput";

import styles from "./PdfViewer.module.css";

interface ToolbarProps {
  pluginInstance: ToolbarPlugin;
}

const Toolbar = ({ pluginInstance }: ToolbarProps) => {
  const { Toolbar } = pluginInstance;

  return (
    <div className={styles.toolbar}>
      <Toolbar>
        {(props: ToolbarSlot) => {
          const { CurrentPageInput, NumberOfPages, ZoomIn, ZoomOut, Download, Zoom, Search } = props;
          return (
            <>
              <div className={styles.inline}>
                <Tooltip
                  position={Position.BottomCenter}
                  target={
                    <Download>
                      {props => (
                        <button className={styles.iconBtn} onClick={props.onClick}>
                          <DownloadIcon />
                        </button>
                      )}
                    </Download>
                  }
                  content={() => "Download PDF"}
                  offset={{ left: 0, top: 8 }}
                />
                <div className={styles.zoomButtons}>
                  <Tooltip
                    position={Position.BottomCenter}
                    target={
                      <ZoomOut>
                        {props => (
                          <button className={styles.zoomBtn} onClick={props.onClick}>
                            <MinusIcon />
                          </button>
                        )}
                      </ZoomOut>
                    }
                    content={() => "Zoom out"}
                    offset={{ left: 0, top: 8 }}
                  />
                  <Tooltip
                    position={Position.BottomCenter}
                    target={
                      <Zoom>
                        {props => (
                          <button className={styles.resetBtn} onClick={() => props.onZoom(SpecialZoomLevel.PageWidth)}>
                            <ResetIcon />
                          </button>
                        )}
                      </Zoom>
                    }
                    content={() => "Reset zoom"}
                    offset={{ left: 0, top: 8 }}
                  />
                  <Tooltip
                    position={Position.BottomCenter}
                    target={
                      <ZoomIn>
                        {props => (
                          <button className={styles.zoomBtn} onClick={props.onClick}>
                            <PlusIcon />
                          </button>
                        )}
                      </ZoomIn>
                    }
                    content={() => "Zoom in"}
                    offset={{ left: 0, top: 8 }}
                  />
                </div>
                <div className={styles.currentPage}>
                  <CurrentPageInput />
                  / <NumberOfPages />
                </div>
              </div>
              <div className={styles.inline}>
                <Search>{props => <SearchInput {...props} />}</Search>
              </div>
            </>
          );
        }}
      </Toolbar>
    </div>
  );
};

export default Toolbar;
