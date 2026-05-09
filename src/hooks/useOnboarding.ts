import { useState } from 'react';
import { postOnboardingAnswers } from '../services/api/onboarding';

export function useOnboarding() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (answers: { question_key: string; answer: string }[]) => {
    setIsSubmitting(true);
    try {
      await postOnboardingAnswers(answers);
    } catch (e) {
      console.log(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, submit };
}
