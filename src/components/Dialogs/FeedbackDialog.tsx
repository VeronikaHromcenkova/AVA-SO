import { FormEvent, useState } from "react";
import { Checkbox, Dialog, PrimaryButton, Stack } from "@fluentui/react";

import { AskResponse, Feedback, historyMessageFeedback } from "../../api";
import {
  inappropriateFeedbackContent,
  unhelpfulFeedbackContent,
} from "../../constants/feedback";

interface FeedbackDialogProps {
  answer: AskResponse;
  isOpen: boolean;
  closeDialog: () => void;
  setFeedbackState: (feedback: Feedback) => void;
}

const FeedbackDialog = ({
  answer,
  isOpen,
  closeDialog,
  setFeedbackState
}: FeedbackDialogProps) => {
  const [showReportInappropriateFeedback, setShowReportInappropriateFeedback] =
    useState(false);
  const [negativeFeedbackList, setNegativeFeedbackList] = useState<Feedback[]>(
    []
  );

  const updateFeedbackList = (
    ev?: FormEvent<HTMLElement | HTMLInputElement>,
    checked?: boolean
  ) => {
    if (answer.message_id == undefined) return;
    const selectedFeedback = (ev?.target as HTMLInputElement)?.id as Feedback;

    let feedbackList = negativeFeedbackList.slice();
    if (checked) {
      feedbackList.push(selectedFeedback);
    } else {
      feedbackList = feedbackList.filter(f => f !== selectedFeedback);
    }

    setNegativeFeedbackList(feedbackList);
  };

  const onSubmitNegativeFeedback = async () => {
    if (answer.message_id == undefined) return;
    await historyMessageFeedback(
      answer.message_id,
      negativeFeedbackList.join(",")
    );
    resetFeedbackDialog();
  };

  const resetFeedbackDialog = () => {
    closeDialog();
    setShowReportInappropriateFeedback(false);
    setNegativeFeedbackList([]);
  };

  const UnhelpfulFeedbackContent = () => {
    return (
      <>
        <div>Why wasn't this response helpful?</div>
        <Stack tokens={{ childrenGap: 10 }}>
          {unhelpfulFeedbackContent.map((feedback, index) => (
            <Checkbox
              key={feedback.id}
              label={feedback.label}
              id={feedback.id}
              defaultChecked={negativeFeedbackList.includes(feedback.id)}
              onChange={updateFeedbackList}
            />
          ))}
        </Stack>
        <div
          onClick={() => setShowReportInappropriateFeedback(true)}
          style={{ color: "#115EA3", cursor: "pointer" }}
        >
          Report inappropriate content
        </div>
      </>
    );
  };

  const ReportInappropriateFeedbackContent = () => {
    return (
      <>
        <div>
          The content is <span style={{ color: "red" }}>*</span>
        </div>
        <Stack tokens={{ childrenGap: 4 }}>
          {inappropriateFeedbackContent.map((feedback, index) => (
            <Checkbox
              key={feedback.id}
              label={feedback.label}
              id={feedback.id}
              defaultChecked={negativeFeedbackList.includes(feedback.id)}
              onChange={updateFeedbackList}
            />
          ))}
        </Stack>
      </>
    );
  };

  return (
    <Dialog
      onDismiss={() => {
        resetFeedbackDialog();
        setFeedbackState(Feedback.Neutral);
      }}
      hidden={!isOpen}
      dialogContentProps={{
        title: "Submit Feedback",
        showCloseButton: true
      }}
    >
      <Stack tokens={{ childrenGap: 10 }}>
        <div>Your feedback will improve this experience.</div>
        {!showReportInappropriateFeedback ? (
          <UnhelpfulFeedbackContent />
        ) : (
          <ReportInappropriateFeedbackContent />
        )}
        <div>
          By pressing submit, your feedback will be visible to the application
          owner.
        </div>
        <PrimaryButton
          disabled={negativeFeedbackList.length < 1}
          onClick={onSubmitNegativeFeedback}
        >
          Submit
        </PrimaryButton>
      </Stack>
    </Dialog>
  );
};

export default FeedbackDialog;
