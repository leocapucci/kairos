export const shareKairos = async (text: string) => {
  const short = text.length > 150 ? text.slice(0, 147) + '...' : text;
  const formatted = short + '\n\n— KAIROS\nDireção diária pra sua vida\n\nhttps://kairos-six-chi.vercel.app';
  if (typeof navigator !== 'undefined' && navigator.share) {
    await navigator.share({ text: formatted });
  } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
    await navigator.clipboard.writeText(formatted);
  }
};
