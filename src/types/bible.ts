export type VerseData = {
  text: string;
  book: string;
  chapter: number;
  verse_number: number;
};

export type DailyResponse = {
  daily_message_id?: string;
  id?: string;
  conforto?: string;
  confronto?: string;
  cards?: Partial<Record<string, string>>;
};

export type SearchResult = {
  book: string;
  chapter: number;
  verse: number;
  text: string;
};
