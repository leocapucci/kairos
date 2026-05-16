export function formatVerseRef(book: string, chapter: string | number, verse_number: string | number) {
  return `${book} ${chapter}:${verse_number}`.trim();
}
