import { useState } from "react";

import styles from "../JiraTicket.module.css";

interface TicketItemProps {
  title: string;
  children: React.ReactNode;
}

const TicketItem: React.FC<TicketItemProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleContent = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.item}>
      <div role="button" className={styles.heading} onClick={toggleContent} tabIndex={0}>
        {title}
      </div>
      {isOpen && <div className={styles.content}>{children}</div>}
    </div>
  );
};

export default TicketItem;
