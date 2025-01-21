import styles from "./ServiceDesk.module.css";

const Header = () => {
  const ticketID = "SUP-123";
  const ticketTitle = "Need help with my computer";

  return (
    <div className={styles.header}>
      <span>{ticketID}:</span>
      <span>{ticketTitle}</span>
    </div>
  );
};

export default Header;
