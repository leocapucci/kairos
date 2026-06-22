import { ImageSourcePropType } from 'react-native';

export type KairosEditionCard = {
  id: number;
  theme: string;
  phrase: string;
  reference: string;
  image: ImageSourcePropType;
  overlayColor: string;
};

const bg1 = require('../assets/kairosbackground.jpg');
const bg2 = require('../assets/kairosbackground2.png');

export const KAIROS_EDITION_CARDS: KairosEditionCard[] = [
  {
    id: 1,
    theme: 'Fé',
    phrase: 'Tudo posso naquele que me fortalece.',
    reference: 'Filipenses 4:13',
    image: bg1,
    overlayColor: 'rgba(45, 38, 31, 0.75)',
  },
  {
    id: 2,
    theme: 'Esperança',
    phrase: 'Porque sou eu que conheço os planos que tenho para vocês — planos de fazê-los prosperar e não de causar dano, planos de dar a vocês esperança e um futuro.',
    reference: 'Jeremias 29:11',
    image: bg2,
    overlayColor: 'rgba(30, 55, 50, 0.75)',
  },
  {
    id: 3,
    theme: 'Amor',
    phrase: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo o que nele crê não pereça, mas tenha a vida eterna.',
    reference: 'João 3:16',
    image: bg1,
    overlayColor: 'rgba(90, 40, 30, 0.75)',
  },
  {
    id: 4,
    theme: 'Paz',
    phrase: 'A paz de Deus, que excede todo o entendimento, guardará os seus corações e as suas mentes em Cristo Jesus.',
    reference: 'Filipenses 4:7',
    image: bg2,
    overlayColor: 'rgba(30, 50, 45, 0.78)',
  },
  {
    id: 5,
    theme: 'Força',
    phrase: 'Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus; eu te fortaleço, e te ajudo, e te sustento com a minha destra fiel.',
    reference: 'Isaías 41:10',
    image: bg1,
    overlayColor: 'rgba(25, 30, 45, 0.78)',
  },
  {
    id: 6,
    theme: 'Graça',
    phrase: 'A minha graça é suficiente para você, porque o poder se aperfeiçoa na fraqueza.',
    reference: '2 Coríntios 12:9',
    image: bg2,
    overlayColor: 'rgba(50, 35, 65, 0.75)',
  },
  {
    id: 7,
    theme: 'Renovação',
    phrase: 'Não vos conformeis com este século, mas transformai-vos pela renovação do vosso entendimento.',
    reference: 'Romanos 12:2',
    image: bg1,
    overlayColor: 'rgba(20, 45, 55, 0.78)',
  },
  {
    id: 8,
    theme: 'Propósito',
    phrase: 'Antes de te formar no ventre materno, eu te conheci; antes de nasceres, eu te consagrei.',
    reference: 'Jeremias 1:5',
    image: bg2,
    overlayColor: 'rgba(60, 40, 20, 0.75)',
  },
  {
    id: 9,
    theme: 'Cura',
    phrase: 'Ele foi ferido por causa das nossas transgressões e esmagado por causa das nossas iniquidades. O castigo que nos traz paz estava sobre ele, e pelas suas feridas fomos curados.',
    reference: 'Isaías 53:5',
    image: bg1,
    overlayColor: 'rgba(55, 25, 25, 0.78)',
  },
  {
    id: 10,
    theme: 'Vitória',
    phrase: 'Mas graças a Deus, que nos dá a vitória por meio de nosso Senhor Jesus Cristo.',
    reference: '1 Coríntios 15:57',
    image: bg2,
    overlayColor: 'rgba(30, 55, 35, 0.75)',
  },
];
