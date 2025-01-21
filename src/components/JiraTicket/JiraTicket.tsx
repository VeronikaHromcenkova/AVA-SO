import Markdown from "react-markdown";
import { Attach12Regular as AttachmentIcon, ShiftsActivity20Regular as Clock } from "@fluentui/react-icons";

import { mockJiraTicket } from "../../pages/service_desk/mockJiraTicket";

import TicketItem from "./components/TicketItem";

import styles from "./JiraTicket.module.css";

const JiraTicket = () => {
  const { description, attachments, comments } = mockJiraTicket;
  const ticketTime = new Date(new Date().setDate(new Date().getDate() + 2)).toISOString();

  const parseDateTime = (dateTime: string) => {
    const date = new Date(dateTime).toLocaleDateString("en-GB");
    const time = new Date(dateTime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

    return `${date} ${time}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.timeLeft}>
        <Clock />
        <span>{parseDateTime(ticketTime)}</span>
      </div>
      <TicketItem title="Description">
        <Markdown className={styles.markdown}>{description}</Markdown>
      </TicketItem>

      {attachments && (
        <TicketItem title="Attachments">
          {attachments.map(attachment => (
            <div key={attachment.id} className={styles.attachment}>
              <AttachmentIcon className={styles.attachmentIcon} />
              <a href="#" target="_blank" rel="noreferrer">
                {attachment.filename}
              </a>
            </div>
          ))}
        </TicketItem>
      )}

      {comments && (
        <TicketItem title="Comments">
          {comments.map(comment => (
            <div key={comment.id} className={styles.comment}>
              <div className={styles.commentHeading}>
                <div className={styles.commentAvatar} style={{ backgroundColor: comment.author.avatarColor }}>
                  {comment.author.name[0]}
                </div>
                <span className={styles.commentAuthor}>{comment.author.name}</span>
                <span className={styles.commentDate}>{parseDateTime(comment.created_at)}</span>
              </div>
              <div className={styles.commentContent}>
                <Markdown className={styles.markdown}>{comment.content}</Markdown>
              </div>
            </div>
          ))}
        </TicketItem>
      )}
    </div>
  );
};

export default JiraTicket;
