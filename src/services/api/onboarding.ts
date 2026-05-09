const BASE = 'https://kairos-backend-vjdp.onrender.com';

export const postOnboardingAnswers = (answers: { question_key: string; answer: string }[]) =>
  fetch(`${BASE}/onboarding`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  });
