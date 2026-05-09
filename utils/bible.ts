const CORRECTIONS: Record<string, string> = {
  Genesis: 'Gênesis', Exodus: 'Êxodo', Leviticus: 'Levítico', Numbers: 'Números',
  Deuteronomy: 'Deuteronômio', Joshua: 'Josué', Judges: 'Juízes', Ruth: 'Rute',
  '1 Samuel': '1 Samuel', '2 Samuel': '2 Samuel', '1 Kings': '1 Reis', '2 Kings': '2 Reis',
  '1 Chronicles': '1 Crônicas', '2 Chronicles': '2 Crônicas', Ezra: 'Esdras',
  Nehemiah: 'Neemias', Esther: 'Ester', Job: 'Jó', Psalms: 'Salmos',
  Proverbs: 'Provérbios', Ecclesiastes: 'Eclesiastes', 'Song of Solomon': 'Cânticos',
  'Song of Songs': 'Cânticos', Canticles: 'Cânticos', Isaiah: 'Isaías',
  Jeremiah: 'Jeremias', Lamentations: 'Lamentações', Ezekiel: 'Ezequiel',
  Daniel: 'Daniel', Hosea: 'Oséias', Joel: 'Joel', Amos: 'Amós', Obadiah: 'Obadias',
  Jonah: 'Jonas', Micah: 'Miquéias', Nahum: 'Naum', Habakkuk: 'Habacuque',
  Zephaniah: 'Sofonias', Haggai: 'Ageu', Zechariah: 'Zacarias', Malachi: 'Malaquias',
  Matthew: 'Mateus', Mark: 'Marcos', Luke: 'Lucas', John: 'João', Acts: 'Atos',
  Romans: 'Romanos', '1 Corinthians': '1 Coríntios', '2 Corinthians': '2 Coríntios',
  Galatians: 'Gálatas', Ephesians: 'Efésios', Philippians: 'Filipenses',
  Colossians: 'Colossenses', '1 Thessalonians': '1 Tessalonicenses',
  '2 Thessalonians': '2 Tessalonicenses', '1 Timothy': '1 Timóteo',
  '2 Timothy': '2 Timóteo', Titus: 'Tito', Philemon: 'Filemom', Hebrews: 'Hebreus',
  James: 'Tiago', '1 Peter': '1 Pedro', '2 Peter': '2 Pedro',
  '1 John': '1 João', '2 John': '2 João', '3 John': '3 João',
  Jude: 'Judas', Revelation: 'Apocalipse',
};

const REVERSE: Record<string, string> = Object.fromEntries(
  Object.entries(CORRECTIONS).map(([en, pt]) => [pt, en])
);

export function normalizeBookName(name: string): string {
  return CORRECTIONS[name] ?? name;
}

export function denormalizeBookName(name: string): string {
  return REVERSE[name] ?? name;
}

export const CHAPTER_COUNTS: Record<string, number> = {
  'Gênesis': 50, 'Êxodo': 40, 'Levítico': 27, 'Números': 36, 'Deuteronômio': 34,
  'Josué': 24, 'Juízes': 21, 'Rute': 4, '1 Samuel': 31, '2 Samuel': 24,
  '1 Reis': 22, '2 Reis': 25, '1 Crônicas': 29, '2 Crônicas': 36, 'Esdras': 10,
  'Neemias': 13, 'Ester': 10, 'Jó': 42, 'Salmos': 150, 'Provérbios': 31,
  'Eclesiastes': 12, 'Cânticos': 8, 'Isaías': 66, 'Jeremias': 52, 'Lamentações': 5,
  'Ezequiel': 48, 'Daniel': 12, 'Oséias': 14, 'Joel': 3, 'Amós': 9, 'Obadias': 1,
  'Jonas': 4, 'Miquéias': 7, 'Naum': 3, 'Habacuque': 3, 'Sofonias': 3, 'Ageu': 2,
  'Zacarias': 14, 'Malaquias': 4, 'Mateus': 28, 'Marcos': 16, 'Lucas': 24, 'João': 21,
  'Atos': 28, 'Romanos': 16, '1 Coríntios': 16, '2 Coríntios': 13, 'Gálatas': 6,
  'Efésios': 6, 'Filipenses': 4, 'Colossenses': 4, '1 Tessalonicenses': 5,
  '2 Tessalonicenses': 3, '1 Timóteo': 6, '2 Timóteo': 4, 'Tito': 3, 'Filemom': 1,
  'Hebreus': 13, 'Tiago': 5, '1 Pedro': 5, '2 Pedro': 3, '1 João': 5, '2 João': 1,
  '3 João': 1, 'Judas': 1, 'Apocalipse': 22,
};

export function getChapterCount(book: string): number {
  return CHAPTER_COUNTS[book] ?? 1;
}
