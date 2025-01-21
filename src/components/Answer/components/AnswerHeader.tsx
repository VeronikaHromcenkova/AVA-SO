import { useContext } from 'react';
import { Stack } from '@fluentui/react';
import {
  ThumbDislike20Filled,
  ThumbDislike20Regular,
  ThumbLike20Filled,
  ThumbLike20Regular
} from '@fluentui/react-icons';

import { AskResponse, Feedback } from '../../../api/models';
import { useAnswerFeedback } from '../../../hooks/useAnswerFeedback';
import { AppStateContext } from '../../../state/AppProvider';
import FeedbackDialog from '../../Dialogs/FeedbackDialog';

import styles from '../Answer.module.css';

interface AnswerHeaderProps {
  answer: AskResponse;
}

const AnswerHeader = ({ answer }: AnswerHeaderProps) => {
  const {
    feedbackState,
    isFeedbackDialogOpen,
    setFeedbackState,
    onDislikeResponseClicked,
    onLikeResponseClicked,
    closeFeedbackDialog
  } = useAnswerFeedback(answer);

  const appStateContext = useContext(AppStateContext);
  const FEEDBACK_ENABLED =
    appStateContext?.state.frontendSettings?.feedback_enabled && appStateContext?.state.isCosmosDBAvailable?.cosmosDB;

  if (!(FEEDBACK_ENABLED && answer.message_id !== undefined)) return null;

  const isLikeActive =
    feedbackState === Feedback.Positive ||
    appStateContext?.state.feedbackState[answer.message_id] === Feedback.Positive;
  const isDislikeActive =
    feedbackState !== Feedback.Positive && feedbackState !== Feedback.Neutral && feedbackState !== undefined;

  const LikeIcon = isLikeActive ? ThumbLike20Filled : ThumbLike20Regular;
  const DislikeIcon = isDislikeActive ? ThumbDislike20Filled : ThumbDislike20Regular;

  return (
    <>
      <div className={styles.answerHeader}>
        <Stack horizontal horizontalAlign="space-between">
          <LikeIcon
            aria-hidden="false"
            aria-label="Like this response"
            onClick={() => onLikeResponseClicked()}
            className={isLikeActive ? styles.activatedLike : styles.inactiveLike}
          />
          <DislikeIcon
            aria-hidden="false"
            aria-label="Dislike this response"
            onClick={() => onDislikeResponseClicked()}
            className={isDislikeActive ? styles.activatedDislike : styles.inactiveDislike}
          />
        </Stack>
      </div>
      <FeedbackDialog
        answer={answer}
        isOpen={isFeedbackDialogOpen}
        closeDialog={closeFeedbackDialog}
        setFeedbackState={setFeedbackState}
      />
    </>
  );
};

export default AnswerHeader;
