export type KairosImageKey = 'bg1' | 'bg2';

export type KairosCategory =
  | 'fe' | 'esperanca' | 'amor' | 'paz' | 'forca' | 'direcao'
  | 'proposito' | 'gratidao' | 'recomeço' | 'coragem' | 'descanso'
  | 'confianca' | 'perseveranca' | 'graca' | 'renovacao' | 'cura'
  | 'vitoria' | 'alegria' | 'especial';

export type KairosCard = {
  id: string;
  theme: string;
  phrase: string;
  reference: string;
  imageKey: KairosImageKey;
  category: KairosCategory;
  overlayColor: string;
};

// ─── Pool de cards (40 cartas para rotação diária) ───────────────────────────

const CARD_POOL: KairosCard[] = [
  {
    id: 'fe_01',
    theme: 'FÉ',
    phrase: 'A fé é a certeza daquilo que esperamos e a prova daquilo que não vemos.',
    reference: 'Hebreus 11:1',
    imageKey: 'bg1',
    category: 'fe',
    overlayColor: 'rgba(55, 40, 10, 0.40)',
  },
  {
    id: 'fe_02',
    theme: 'FÉ',
    phrase: 'Tudo é possível ao que crê.',
    reference: 'Marcos 9:23',
    imageKey: 'bg2',
    category: 'fe',
    overlayColor: 'rgba(45, 30, 5, 0.42)',
  },
  {
    id: 'esperanca_01',
    theme: 'ESPERANÇA',
    phrase: 'Porque sou eu que conheço os planos que tenho para vocês — planos de fazê-los prosperar e não de causar dano, planos de dar a vocês esperança e um futuro.',
    reference: 'Jeremias 29:11',
    imageKey: 'bg2',
    category: 'esperanca',
    overlayColor: 'rgba(20, 40, 55, 0.40)',
  },
  {
    id: 'esperanca_02',
    theme: 'ESPERANÇA',
    phrase: 'A esperança não nos envergonha, porque o amor de Deus foi derramado em nossos corações.',
    reference: 'Romanos 5:5',
    imageKey: 'bg1',
    category: 'esperanca',
    overlayColor: 'rgba(15, 35, 50, 0.42)',
  },
  {
    id: 'perseveranca_01',
    theme: 'PERSEVERANÇA',
    phrase: 'Não nos cansemos de fazer o bem, porque a seu tempo ceifaremos, se não desanimarmos.',
    reference: 'Gálatas 6:9',
    imageKey: 'bg1',
    category: 'perseveranca',
    overlayColor: 'rgba(65, 30, 10, 0.40)',
  },
  {
    id: 'perseveranca_02',
    theme: 'PERSEVERANÇA',
    phrase: 'Mas os que esperam no SENHOR renovarão as suas forças, subirão com asas como águias.',
    reference: 'Isaías 40:31',
    imageKey: 'bg2',
    category: 'perseveranca',
    overlayColor: 'rgba(55, 25, 8, 0.42)',
  },
  {
    id: 'forca_01',
    theme: 'FORÇA',
    phrase: 'Tudo posso naquele que me fortalece.',
    reference: 'Filipenses 4:13',
    imageKey: 'bg1',
    category: 'forca',
    overlayColor: 'rgba(75, 20, 10, 0.40)',
  },
  {
    id: 'forca_02',
    theme: 'FORÇA',
    phrase: 'Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus; eu te fortaleço, e te ajudo.',
    reference: 'Isaías 41:10',
    imageKey: 'bg2',
    category: 'forca',
    overlayColor: 'rgba(65, 15, 8, 0.42)',
  },
  {
    id: 'coragem_01',
    theme: 'CORAGEM',
    phrase: 'Seja forte e corajoso! Não se apavore, nem desanime, pois o SENHOR, o seu Deus, estará com você.',
    reference: 'Josué 1:9',
    imageKey: 'bg2',
    category: 'coragem',
    overlayColor: 'rgba(70, 25, 15, 0.40)',
  },
  {
    id: 'coragem_02',
    theme: 'CORAGEM',
    phrase: 'No mundo vocês terão aflições; contudo, tenham ânimo! Eu venci o mundo.',
    reference: 'João 16:33',
    imageKey: 'bg1',
    category: 'coragem',
    overlayColor: 'rgba(60, 20, 12, 0.42)',
  },
  {
    id: 'paz_01',
    theme: 'PAZ',
    phrase: 'A paz de Deus, que excede todo o entendimento, guardará os seus corações e as suas mentes em Cristo Jesus.',
    reference: 'Filipenses 4:7',
    imageKey: 'bg1',
    category: 'paz',
    overlayColor: 'rgba(10, 45, 50, 0.40)',
  },
  {
    id: 'paz_02',
    theme: 'PAZ',
    phrase: 'A paz eu lhes deixo; a minha paz eu lhes dou. Não a dou como o mundo a dá.',
    reference: 'João 14:27',
    imageKey: 'bg2',
    category: 'paz',
    overlayColor: 'rgba(8, 40, 48, 0.42)',
  },
  {
    id: 'descanso_01',
    theme: 'DESCANSO',
    phrase: 'Venham a mim, todos os que estão cansados e sobrecarregados, e eu lhes darei descanso.',
    reference: 'Mateus 11:28',
    imageKey: 'bg2',
    category: 'descanso',
    overlayColor: 'rgba(15, 40, 45, 0.40)',
  },
  {
    id: 'descanso_02',
    theme: 'DESCANSO',
    phrase: 'Ele me faz repousar em pastos verdes, guia-me para junto de águas tranquilas.',
    reference: 'Salmos 23:2',
    imageKey: 'bg1',
    category: 'descanso',
    overlayColor: 'rgba(12, 38, 42, 0.42)',
  },
  {
    id: 'direcao_01',
    theme: 'DIREÇÃO',
    phrase: 'Confia no SENHOR de todo o teu coração e não te apoies no teu próprio entendimento; reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas.',
    reference: 'Provérbios 3:5-6',
    imageKey: 'bg1',
    category: 'direcao',
    overlayColor: 'rgba(20, 15, 55, 0.40)',
  },
  {
    id: 'direcao_02',
    theme: 'DIREÇÃO',
    phrase: 'A tua palavra é lâmpada que ilumina os meus passos e luz que clareia o meu caminho.',
    reference: 'Salmos 119:105',
    imageKey: 'bg2',
    category: 'direcao',
    overlayColor: 'rgba(18, 12, 50, 0.42)',
  },
  {
    id: 'proposito_01',
    theme: 'PROPÓSITO',
    phrase: 'Antes de te formar no ventre materno, eu te conheci; antes de nasceres, eu te consagrei.',
    reference: 'Jeremias 1:5',
    imageKey: 'bg2',
    category: 'proposito',
    overlayColor: 'rgba(15, 20, 50, 0.40)',
  },
  {
    id: 'proposito_02',
    theme: 'PROPÓSITO',
    phrase: 'Pois somos criação de Deus realizada em Cristo Jesus para fazer boas obras.',
    reference: 'Efésios 2:10',
    imageKey: 'bg1',
    category: 'proposito',
    overlayColor: 'rgba(12, 18, 45, 0.42)',
  },
  {
    id: 'gratidao_01',
    theme: 'GRATIDÃO',
    phrase: 'Deem graças em todas as circunstâncias, pois esta é a vontade de Deus para vocês em Cristo Jesus.',
    reference: '1 Tessalonicenses 5:18',
    imageKey: 'bg1',
    category: 'gratidao',
    overlayColor: 'rgba(55, 35, 5, 0.40)',
  },
  {
    id: 'gratidao_02',
    theme: 'GRATIDÃO',
    phrase: 'Cantem ao SENHOR com ação de graças; celebrem com músicas a nosso Deus.',
    reference: 'Salmos 147:7',
    imageKey: 'bg2',
    category: 'gratidao',
    overlayColor: 'rgba(50, 30, 5, 0.42)',
  },
  {
    id: 'recomeço_01',
    theme: 'RECOMEÇO',
    phrase: 'Eis que faço novas todas as coisas.',
    reference: 'Apocalipse 21:5',
    imageKey: 'bg2',
    category: 'recomeço',
    overlayColor: 'rgba(10, 45, 30, 0.40)',
  },
  {
    id: 'recomeço_02',
    theme: 'RECOMEÇO',
    phrase: 'As misericórdias do SENHOR não têm fim! Suas compaixões jamais se esgotam. Renovam-se a cada manhã.',
    reference: 'Lamentações 3:22-23',
    imageKey: 'bg1',
    category: 'recomeço',
    overlayColor: 'rgba(8, 40, 25, 0.42)',
  },
  {
    id: 'amor_01',
    theme: 'AMOR',
    phrase: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo o que nele crê não pereça, mas tenha a vida eterna.',
    reference: 'João 3:16',
    imageKey: 'bg1',
    category: 'amor',
    overlayColor: 'rgba(65, 15, 30, 0.40)',
  },
  {
    id: 'amor_02',
    theme: 'AMOR',
    phrase: 'O amor é paciente, o amor é bondoso. O amor não é invejoso, não se vangloria, não se orgulha.',
    reference: '1 Coríntios 13:4',
    imageKey: 'bg2',
    category: 'amor',
    overlayColor: 'rgba(58, 12, 25, 0.42)',
  },
  {
    id: 'graca_01',
    theme: 'GRAÇA',
    phrase: 'A minha graça é suficiente para você, porque o poder se aperfeiçoa na fraqueza.',
    reference: '2 Coríntios 12:9',
    imageKey: 'bg2',
    category: 'graca',
    overlayColor: 'rgba(40, 15, 55, 0.40)',
  },
  {
    id: 'graca_02',
    theme: 'GRAÇA',
    phrase: 'Pela graça vocês são salvos, por meio da fé; isso não vem de vocês, é dom de Deus.',
    reference: 'Efésios 2:8',
    imageKey: 'bg1',
    category: 'graca',
    overlayColor: 'rgba(35, 12, 50, 0.42)',
  },
  {
    id: 'renovacao_01',
    theme: 'RENOVAÇÃO',
    phrase: 'Não vos conformeis com este século, mas transformai-vos pela renovação do vosso entendimento.',
    reference: 'Romanos 12:2',
    imageKey: 'bg1',
    category: 'renovacao',
    overlayColor: 'rgba(12, 48, 28, 0.40)',
  },
  {
    id: 'renovacao_02',
    theme: 'RENOVAÇÃO',
    phrase: 'Portanto, se alguém está em Cristo, é nova criatura; as coisas antigas já passaram, eis que se fizeram novas.',
    reference: '2 Coríntios 5:17',
    imageKey: 'bg2',
    category: 'renovacao',
    overlayColor: 'rgba(10, 44, 24, 0.42)',
  },
  {
    id: 'cura_01',
    theme: 'CURA',
    phrase: 'Pelas suas feridas fomos curados.',
    reference: 'Isaías 53:5',
    imageKey: 'bg2',
    category: 'cura',
    overlayColor: 'rgba(50, 20, 20, 0.40)',
  },
  {
    id: 'cura_02',
    theme: 'CURA',
    phrase: 'Ele cura os que têm o coração quebrantado e cura as suas feridas.',
    reference: 'Salmos 147:3',
    imageKey: 'bg1',
    category: 'cura',
    overlayColor: 'rgba(45, 18, 18, 0.42)',
  },
  {
    id: 'vitoria_01',
    theme: 'VITÓRIA',
    phrase: 'Mas graças a Deus, que nos dá a vitória por meio de nosso Senhor Jesus Cristo.',
    reference: '1 Coríntios 15:57',
    imageKey: 'bg1',
    category: 'vitoria',
    overlayColor: 'rgba(40, 12, 60, 0.40)',
  },
  {
    id: 'vitoria_02',
    theme: 'VITÓRIA',
    phrase: 'Em tudo isso somos mais que vencedores, por meio daquele que nos amou.',
    reference: 'Romanos 8:37',
    imageKey: 'bg2',
    category: 'vitoria',
    overlayColor: 'rgba(35, 10, 55, 0.42)',
  },
  {
    id: 'confianca_01',
    theme: 'CONFIANÇA',
    phrase: 'O SENHOR é a minha luz e a minha salvação; a quem temerei? O SENHOR é a força da minha vida; a quem me recearei?',
    reference: 'Salmos 27:1',
    imageKey: 'bg2',
    category: 'confianca',
    overlayColor: 'rgba(12, 28, 55, 0.40)',
  },
  {
    id: 'confianca_02',
    theme: 'CONFIANÇA',
    phrase: 'Entrega o teu caminho ao SENHOR; confia nele, e ele tudo fará.',
    reference: 'Salmos 37:5',
    imageKey: 'bg1',
    category: 'confianca',
    overlayColor: 'rgba(10, 25, 50, 0.42)',
  },
  {
    id: 'alegria_01',
    theme: 'ALEGRIA',
    phrase: 'Regozijai-vos sempre no Senhor! Reitero: Regozijai-vos!',
    reference: 'Filipenses 4:4',
    imageKey: 'bg1',
    category: 'alegria',
    overlayColor: 'rgba(50, 38, 5, 0.40)',
  },
  {
    id: 'alegria_02',
    theme: 'ALEGRIA',
    phrase: 'A alegria do SENHOR é a vossa força.',
    reference: 'Neemias 8:10',
    imageKey: 'bg2',
    category: 'alegria',
    overlayColor: 'rgba(45, 33, 5, 0.42)',
  },
  {
    id: 'identidade_01',
    theme: 'IDENTIDADE',
    phrase: 'Mas vocês são geração eleita, sacerdócio real, nação santa, povo adquirido por Deus.',
    reference: '1 Pedro 2:9',
    imageKey: 'bg2',
    category: 'proposito',
    overlayColor: 'rgba(18, 22, 52, 0.40)',
  },
  {
    id: 'provisao_01',
    theme: 'PROVISÃO',
    phrase: 'O meu Deus, segundo as suas riquezas em glória em Cristo Jesus, suprirá todas as suas necessidades.',
    reference: 'Filipenses 4:19',
    imageKey: 'bg1',
    category: 'fe',
    overlayColor: 'rgba(50, 32, 8, 0.40)',
  },
  {
    id: 'presenca_01',
    theme: 'PRESENÇA',
    phrase: 'Eis que estou convosco todos os dias, até o fim do mundo.',
    reference: 'Mateus 28:20',
    imageKey: 'bg2',
    category: 'confianca',
    overlayColor: 'rgba(10, 30, 48, 0.40)',
  },
  {
    id: 'sabedoria_01',
    theme: 'SABEDORIA',
    phrase: 'Se algum de vocês tem falta de sabedoria, peça-a a Deus, que a todos dá liberalmente e não faz reprovação.',
    reference: 'Tiago 1:5',
    imageKey: 'bg2',
    category: 'direcao',
    overlayColor: 'rgba(15, 18, 48, 0.40)',
  },
];

// ─── Cards sazonais / especiais ───────────────────────────────────────────────

const ESPECIAL_SEGUNDA: KairosCard = {
  id: 'especial_segunda',
  theme: 'FORÇA PARA A SEMANA',
  phrase: 'A cada manhã as misericórdias do Senhor se renovam. Que esta semana seja marcada pela sua graça.',
  reference: 'Lamentações 3:23',
  imageKey: 'bg1',
  category: 'especial',
  overlayColor: 'rgba(60, 25, 10, 0.40)',
};

const ESPECIAL_SEXTA: KairosCard = {
  id: 'especial_sexta',
  theme: 'VOCÊ CHEGOU ATÉ AQUI',
  phrase: 'O Senhor esteve com você em cada momento desta semana. Toda honra pertence a ele.',
  reference: 'Josué 1:9',
  imageKey: 'bg2',
  category: 'especial',
  overlayColor: 'rgba(45, 12, 55, 0.40)',
};

const ESPECIAL_DOMINGO: KairosCard = {
  id: 'especial_domingo',
  theme: 'DIA DE DESCANSO',
  phrase: 'No sétimo dia Deus descansou de toda a sua obra. Este é um dia sagrado para renovar forças.',
  reference: 'Gênesis 2:2',
  imageKey: 'bg2',
  category: 'especial',
  overlayColor: 'rgba(12, 42, 30, 0.40)',
};

const ESPECIAL_NATAL: KairosCard = {
  id: 'especial_natal',
  theme: 'NATAL',
  phrase: 'O Verbo se fez carne e habitou entre nós. E nós contemplamos a sua glória.',
  reference: 'João 1:14',
  imageKey: 'bg1',
  category: 'especial',
  overlayColor: 'rgba(10, 20, 65, 0.45)',
};

const ESPECIAL_ANO_NOVO: KairosCard = {
  id: 'especial_ano_novo',
  theme: 'ANO NOVO',
  phrase: 'Eis que faço novas todas as coisas. Que este ano seja marcado pelo teu amor e presença.',
  reference: 'Apocalipse 21:5',
  imageKey: 'bg2',
  category: 'especial',
  overlayColor: 'rgba(10, 15, 60, 0.45)',
};

const ESPECIAL_PASCOA: KairosCard = {
  id: 'especial_pascoa',
  theme: 'PÁSCOA',
  phrase: 'Ele não está aqui; ressuscitou, como havia dito. Venham ver o lugar onde ele estava.',
  reference: 'Mateus 28:6',
  imageKey: 'bg1',
  category: 'especial',
  overlayColor: 'rgba(50, 12, 12, 0.45)',
};

const ESPECIAL_DIA_MAES: KairosCard = {
  id: 'especial_dia_maes',
  theme: 'DIA DAS MÃES',
  phrase: 'Seus filhos a chamam feliz; seu marido também a louva: muitas mulheres são virtuosas, mas você as supera a todas.',
  reference: 'Provérbios 31:28-29',
  imageKey: 'bg1',
  category: 'especial',
  overlayColor: 'rgba(60, 12, 35, 0.42)',
};

const ESPECIAL_DIA_PAIS: KairosCard = {
  id: 'especial_dia_pais',
  theme: 'DIA DOS PAIS',
  phrase: 'O pai de um filho justo se alegrará muito; o que tiver um filho sábio se regozijará nele.',
  reference: 'Provérbios 23:24',
  imageKey: 'bg2',
  category: 'especial',
  overlayColor: 'rgba(20, 35, 55, 0.42)',
};

// ─── Utilitários ──────────────────────────────────────────────────────────────

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (Math.imul(s ^ (s >>> 17), 0x45d9f3b) ^ ((s * 1013904223) | 0)) >>> 0;
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function getEasterDate(year: number): { month: number; day: number } {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { month, day };
}

function getNthSundayOfMonth(year: number, month: number, n: number): number {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const firstSunday = firstDay === 0 ? 1 : 8 - firstDay;
  return firstSunday + (n - 1) * 7;
}

// ─── Coleção diária ───────────────────────────────────────────────────────────

export function getDailyCollection(): KairosCard[] {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const dow = today.getDay(); // 0=Dom, 1=Seg, ..., 5=Sex, 6=Sab

  const specials: KairosCard[] = [];

  // Feriados fixos
  if (month === 12 && day === 25) {
    specials.push(ESPECIAL_NATAL);
  } else if (month === 1 && day === 1) {
    specials.push(ESPECIAL_ANO_NOVO);
  } else {
    // Páscoa
    const easter = getEasterDate(year);
    if (month === easter.month && day === easter.day) {
      specials.push(ESPECIAL_PASCOA);
    }
  }

  // Dia das Mães: 2º domingo de maio (Brasil)
  if (month === 5 && day === getNthSundayOfMonth(year, 5, 2)) {
    specials.push(ESPECIAL_DIA_MAES);
  }

  // Dia dos Pais: 2º domingo de agosto (Brasil)
  if (month === 8 && day === getNthSundayOfMonth(year, 8, 2)) {
    specials.push(ESPECIAL_DIA_PAIS);
  }

  // Especiais do dia da semana (só se não houver feriado)
  if (specials.length === 0) {
    if (dow === 0) specials.push(ESPECIAL_DOMINGO);
    else if (dow === 1) specials.push(ESPECIAL_SEGUNDA);
    else if (dow === 5) specials.push(ESPECIAL_SEXTA);
  }

  const specialIds = new Set(specials.map((c) => c.id));
  const seed = year * 10000 + month * 100 + day;
  const shuffled = seededShuffle(
    CARD_POOL.filter((c) => !specialIds.has(c.id)),
    seed,
  );
  const remaining = shuffled.slice(0, 10 - specials.length);

  return [...specials, ...remaining];
}
