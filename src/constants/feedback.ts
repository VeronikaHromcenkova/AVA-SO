import { Feedback } from "../api/models";

interface FeedbackContent {
  label: string;
  id: Feedback;
}

export const unhelpfulFeedbackContent: FeedbackContent[] = [
  {
    label: "Citations are missing",
    id: Feedback.MissingCitation,
  },
  {
    label: "Citations are wrong",
    id: Feedback.WrongCitation,
  },
  {
    label: "The response is not from my data",
    id: Feedback.OutOfScope,
  },
  {
    label: "Inaccurate or irrelevant",
    id: Feedback.InaccurateOrIrrelevant,
  },
  {
    label: "Other",
    id: Feedback.OtherUnhelpful,
  },
];

export const inappropriateFeedbackContent: FeedbackContent[] = [
  {
    label: "Hate speech, stereotyping, demeaning",
    id: Feedback.HateSpeech,
  },
  {
    label: "Violent: glorification of violence, self-harm",
    id: Feedback.Violent,
  },
  {
    label: "Sexual: explicit content, grooming",
    id: Feedback.Sexual,
  },
  {
    label: "Manipulative: devious, emotional, pushy, bullying",
    id: Feedback.Manipulative,
  },
  {
    label: "Other",
    id: Feedback.OtherHarmful,
  },
];
