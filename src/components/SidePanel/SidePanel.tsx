import { IconButton, Stack } from "@fluentui/react";

import styles from "./SidePanel.module.css";

interface SidePanelProps {
  title: string;
  onClose: () => void;
  children?: React.ReactNode;
}

const SidePanel = ({ title, onClose, children }: SidePanelProps) => {
  return (
    <Stack.Item className={styles.panel} tabIndex={0} role="tabpanel" aria-label="Side panel">
      <Stack
        aria-label="Panel Header Container"
        horizontal
        className={styles.headerContainer}
        horizontalAlign="space-between"
        verticalAlign="center">
        <span aria-label="Citations" className={styles.header}>
          {title}
        </span>
        <IconButton iconProps={{ iconName: "Cancel" }} aria-label="Close panel" onClick={onClose} />
      </Stack>
      {children}
    </Stack.Item>
  );
};

export default SidePanel;
