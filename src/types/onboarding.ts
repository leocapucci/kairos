export type OnboardingAnswer = {
  question_key: string;
  answer: string;
};

export type OnboardingOption = {
  value: string;
  label: string;
};

export type OnboardingQuestion = {
  key: string;
  question: string;
  options: OnboardingOption[];
};
