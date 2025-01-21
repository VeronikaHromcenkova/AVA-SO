import { useContext, useEffect, useState } from 'react';

import { historyMessageFeedback } from '../api';
import { AskResponse, Feedback } from '../api/models';
import { AppStateContext } from '../state/AppProvider';

export const useAnswerFeedback = (answer: AskResponse) => {
  const appStateContext = useContext(AppStateContext);
  const [feedbackState, setFeedbackState] = useState(initializeAnswerFeedback(answer));
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);

  useEffect(() => {
    if (answer.message_id == undefined) return;

    let currentFeedbackState;
    if (appStateContext?.state.feedbackState && appStateContext?.state.feedbackState[answer.message_id]) {
      currentFeedbackState = appStateContext?.state.feedbackState[answer.message_id];
    } else {
      currentFeedbackState = initializeAnswerFeedback(answer);
    }
    setFeedbackState(currentFeedbackState);
  }, [appStateContext?.state.feedbackState, feedbackState, answer.message_id]);

  const closeFeedbackDialog = () => {
    setIsFeedbackDialogOpen(false);
  };

  const onLikeResponseClicked = async () => {
    if (answer.message_id == undefined) return;
    let newFeedbackState = feedbackState;
    // Set or unset the thumbs up state
    if (feedbackState == Feedback.Positive) {
      newFeedbackState = Feedback.Neutral;
    } else {
      newFeedbackState = Feedback.Positive;
    }
    appStateContext?.dispatch({
      type: 'SET_FEEDBACK_STATE',
      payload: { answerId: answer.message_id, feedback: newFeedbackState }
    });
    setFeedbackState(newFeedbackState);
    // Update message feedback in db
    await historyMessageFeedback(answer.message_id, newFeedbackState);
  };

  const onDislikeResponseClicked = async () => {
    if (answer.message_id == undefined) return;
    let newFeedbackState = feedbackState;
    if (feedbackState === undefined || feedbackState === Feedback.Neutral || feedbackState === Feedback.Positive) {
      newFeedbackState = Feedback.Negative;
      setFeedbackState(newFeedbackState);
      setIsFeedbackDialogOpen(true);
    } else {
      // Reset negative feedback to neutral
      newFeedbackState = Feedback.Neutral;
      setFeedbackState(newFeedbackState);
      await historyMessageFeedback(answer.message_id, Feedback.Neutral);
    }
    appStateContext?.dispatch({
      type: 'SET_FEEDBACK_STATE',
      payload: { answerId: answer.message_id, feedback: newFeedbackState }
    });
  };

  return {
    feedbackState,
    isFeedbackDialogOpen,
    setFeedbackState,
    onLikeResponseClicked,
    onDislikeResponseClicked,
    closeFeedbackDialog
  };
};

const initializeAnswerFeedback = (answer: AskResponse) => {
  if (answer.message_id == undefined) return undefined;
  if (answer.feedback == undefined) return undefined;
  if (answer.feedback.split(',').length > 1) return Feedback.Negative;
  if (Object.values(Feedback).includes(answer.feedback)) return answer.feedback;
  return Feedback.Neutral;
};
