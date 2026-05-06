# Kairos — Briefing para desenvolvimento com Cursor / IA

## O que é o Kairos

App de direção espiritual diária com inteligência artificial.
Diferente de apps devocionais tradicionais, o Kairos não entrega apenas versículos — entrega conforto, confronto, crescimento e aplicação prática, gerados por IA com base num prompt cuidadosamente calibrado.

**Tagline:** Kairos. *O tempo certo.*

**Público:** qualquer pessoa em busca de espiritualidade — cristãos, pessoas em transição de fé, buscadores sem denominação.

**Plataforma:** React Native com Expo (SDK 51+)

---

## Identidade visual

### Nome
KAIROS (caixa alta no logo, normal no texto corrido)

### Símbolo SVG
Círculo com abertura sutil + ponto dourado no centro.
O círculo representa o tempo (chronos). O ponto representa o instante (kairos) — o momento em que algo atravessa o ordinário.

```svg
<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path
    d="M40 8 C56 8, 72 22, 72 40 C72 58, 57 72, 40 72 C23 72, 8 57.5, 8 40 C8 23, 22 8, 40 8 Z"
    fill="none"
    stroke="#B8C9E0"
    stroke-width="3.5"
    stroke-linecap="round"
    stroke-dasharray="195 8"
  />
  <circle cx="40" cy="40" r="4.5" fill="#C9A84C"/>
  <circle cx="40" cy="40" r="2" fill="#12203A"/>
</svg>
```

> Para fundo claro, troque o stroke do path para `#12203A`.
> Para fundo brand (azul noite), use stroke `#B8C9E0`.

### Paleta de cores — `constants/colors.ts`

```typescript
export const Colors = {
  // Fundos
  background:       '#12203A',   // fundo principal (azul noite)
  surface:          '#1E3356',   // cards, superfícies elevadas
  surfaceDeep:      '#0D1827',   // nav bar, fundos profundos
  border:           '#2C4A78',   // bordas, separadores

  // Dourado — identidade e CTAs
  gold:             '#C9A84C',   // cor primária de ação
  goldLight:        '#E8C96A',   // hover, destaque

  // Texto
  textPrimary:      '#E8E0CC',   // texto principal
  textSecondary:    '#B8C9E0',   // texto secundário
  textTertiary:     '#6E8AAA',   // texto desabilitado, datas

  // Fundo claro (splash, onboarding)
  bgLight:          '#F5F2EC',
  cream:            '#E8E0CC',

  // Cards de conteúdo (4 tipos)
  cardComfort:      '#1E3356',   // conforto — azul profundo
  cardConfrontation:'#2A1F10',   // confronto — marrom escuro
  cardGrowth:       '#0F2620',   // crescimento — verde escuro
  cardDevotional:   '#1A1230',   // devocional — roxo escuro

  // Texto dos cards
  textComfort:      '#E8E0CC',
  textConfrontation:'#E8D4A8',
  textGrowth:       '#C8E8DE',
  textDevotional:   '#CECBF6',

  // Tags dos cards
  tagComfort:       '#B8C9E0',
  tagConfrontation: '#C9A84C',
  tagGrowth:        '#5DCAA5',
  tagDevotional:    '#AFA9EC',
};
```

### Tipografia

- **Fonte principal:** System font (San Francisco no iOS, Roboto no Android)
- **Pesos usados:** 300 (light, logo), 400 (corpo), 500 (títulos, botões)
- **Tamanhos:**
  - Logo/splash: 28px, letter-spacing 0.18em, uppercase
  - Título de tela: 22px, weight 500
  - Corpo de card: 14px, line-height 1.5
  - Tag de card: 10px, weight 500, uppercase, letter-spacing 0.08em
  - Texto secundário: 12px
  - Legenda/data: 11px, uppercase, letter-spacing 0.08em

---

## Arquitetura do projeto

### Stack
- **Framework:** Expo SDK 51 com Expo Router (file-based navigation)
- **Linguagem:** TypeScript
- **Backend:** Node.js + Express (já construído, ver `index.js`)
- **Banco:** PostgreSQL via Supabase
- **IA:** Claude Haiku (interações rápidas) + Claude Sonnet (devocional diário)
- **Deploy backend:** Railway

### Estrutura de pastas

```
kairos/
├── app/                      # Expo Router — telas
│   ├── _layout.tsx           # root layout, navegação
│   ├── index.tsx             # splash (redireciona)
│   ├── onboarding.tsx        # 3 perguntas iniciais
│   ├── home.tsx              # direção do dia
│   ├── interaction.tsx       # tela de botões + resposta IA
│   └── profile.tsx           # perfil e padrões
├── components/               # componentes reutilizáveis
│   ├── KairosSymbol.tsx      # símbolo SVG
│   ├── DayCard.tsx           # card de conteúdo (conforto/confronto/etc)
│   ├── InteractionButton.tsx # botão de resposta
│   └── DeepModal.tsx         # modal de segunda camada
├── services/
│   └── api.ts                # todas as chamadas ao backend
├── constants/
│   ├── colors.ts             # paleta acima
│   └── questions.ts          # perguntas do onboarding
├── hooks/
│   └── useUser.ts            # device_id, dados do usuário
└── assets/
    └── icon.png              # símbolo exportado
```

### Dependências principais

```bash
npx create-expo-app kairos --template blank-typescript
cd kairos
npx expo install expo-router react-native-safe-area-context react-native-screens
npm install axios @react-native-async-storage/async-storage
npx expo install expo-haptics expo-status-bar
```

---

## Telas — especificação completa

### 1. Splash (`app/index.tsx`)

- Fundo: `#12203A`
- Centro: símbolo SVG (80px) + nome "KAIROS" (28px, light, letter-spacing) + tagline "*O tempo certo.*" (12px, itálico, textTertiary)
- Duração: 2.5s com fade-out suave
- Lógica: verifica AsyncStorage → se tem `device_id`, vai para `home`; senão vai para `onboarding`

### 2. Onboarding (`app/onboarding.tsx`)

3 perguntas em sequência, uma por tela. Barra de progresso no topo (3 pontos).

**Perguntas:**
```typescript
[
  {
    key: 'life_phase',
    question: 'Em qual fase da vida você está agora?',
    options: [
      { value: 'adolescente',  label: 'Adolescência (13–17 anos)' },
      { value: 'jovem_adulto', label: 'Jovem adulto (18–29 anos)' },
      { value: 'adulto',       label: 'Adulto (30–50 anos)' },
      { value: 'maduro',       label: 'Maduro (50+ anos)' },
    ],
  },
  {
    key: 'main_struggle',
    question: 'Qual é a sua maior luta agora?',
    options: [
      { value: 'ansiedade',      label: 'Ansiedade e medo do futuro' },
      { value: 'relacionamento', label: 'Relacionamentos difíceis' },
      { value: 'proposito',      label: 'Falta de propósito ou direção' },
      { value: 'fe',             label: 'Dúvidas sobre a fé' },
      { value: 'financeiro',     label: 'Pressão financeira' },
      { value: 'luto',           label: 'Luto ou perda' },
    ],
  },
  {
    key: 'faith_level',
    question: 'Como você descreveria sua caminhada espiritual hoje?',
    options: [
      { value: 'iniciando',  label: 'Estou começando a conhecer' },
      { value: 'retomando',  label: 'Estou retomando após um tempo longe' },
      { value: 'crescendo',  label: 'Estou crescendo e buscando mais' },
      { value: 'firme',      label: 'Estou firme e quero aprofundar' },
    ],
  },
]
```

**UX:**
- Opção selecionada: borda `#C9A84C` (1.5px), background `rgba(201,168,76,0.08)`
- Botão "Continuar": desabilitado até selecionar. Cor: `#C9A84C`, texto `#12203A`
- Última tela: botão "Ver minha direção de hoje"
- Ao finalizar: salva no AsyncStorage + POST `/onboarding` + gera `device_id` + navega para `home`

### 3. Home (`app/home.tsx`)

- Header: data por extenso (textTertiary, uppercase) + "Direção de hoje" (22px, textPrimary) + "toque para interagir" (textTertiary)
- 4 cards empilhados, cada um com:
  - Tag (ex: "CONFORTO") no topo
  - Texto de 1–3 frases
  - Pressable — abre `interaction.tsx` passando o tipo
- Footer nav: 4 pontos, o ativo é dourado
- Ao abrir: chama GET `/daily` com header `x-device-id`
- Loading state: skeleton dos 4 cards (retângulos com opacity 0.3, animação de pulso)

**Cards:**
```typescript
const CARD_CONFIG = {
  conforto:  { bg: Colors.cardComfort,       tag: Colors.tagComfort,       text: Colors.textComfort       },
  confronto: { bg: Colors.cardConfrontation, tag: Colors.tagConfrontation, text: Colors.textConfrontation },
  crescimento:{ bg: Colors.cardGrowth,       tag: Colors.tagGrowth,        text: Colors.textGrowth        },
  devocional: { bg: Colors.cardDevotional,   tag: Colors.tagDevotional,    text: Colors.textDevotional    },
};
```

### 4. Interação (`app/interaction.tsx`)

Recebe `type` e `daily_message_id` como params de rota.

- Fundo: mesma cor do card selecionado
- Topo: tag do tipo + ícone de voltar
- Corpo: texto do card (maior, centralizado)
- Footer: 4 botões de resposta em grade 2×2

**Botões:**
```
[🙏 Me trouxe paz]   [⚔️ Me confrontou]
[🧭 Preciso de direção]  [❓ Não entendi]
```

- Ao pressionar: POST `/interaction` → resposta aparece num card abaixo com animação de fade-in
- Se resposta tem `follow_up.question`: aparece pergunta + 2 opções ("Seja direto comigo" / "Quero refletir mais")
- Ao escolher opção: abre `DeepModal`

### 5. Deep Modal (`components/DeepModal.tsx`)

- Modal de bottom sheet (desliza de baixo para cima)
- Fundo: `#0D1827`
- Mostra: pergunta do follow-up + escolha feita + resposta da IA (POST `/interaction/deep`)
- Botão fechar: X no topo direito

### 6. Perfil (`app/profile.tsx`)

- Header: símbolo pequeno (32px) + "Kairos. *O tempo certo.*"
- Seção padrões: 4 contadores (conforto/confronto/direção/dúvida) em grid 2×2
- Streak de dias: número grande + "dias seguidos"
- Respostas do onboarding: lista das 3 perguntas + resposta dada (editável no futuro)
- Footer: versão do app

---

## Serviço de API — `services/api.ts`

```typescript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://SEU-BACKEND.railway.app'; // trocar após deploy

const api = axios.create({ baseURL: BASE_URL });

// Injeta device_id em todo request
api.interceptors.request.use(async (config) => {
  let deviceId = await AsyncStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    await AsyncStorage.setItem('device_id', deviceId);
  }
  config.headers['x-device-id'] = deviceId;
  return config;
});

export const getDaily       = ()                                    => api.get('/daily');
export const postInteraction = (type: string)                       => api.post('/interaction', { type });
export const postDeep        = (interaction_id: string, user_choice: string) =>
                                api.post('/interaction/deep', { interaction_id, user_choice });
export const postOnboarding  = (answers: { question_key: string; answer: string }[]) =>
                                api.post('/onboarding', { answers });
export const getProfile      = ()                                    => api.get('/user/profile');
```

---

## Ordem de construção recomendada

Construir uma tela por sessão com o Cursor, nesta ordem:

1. `constants/colors.ts` + `services/api.ts` — base de tudo
2. `components/KairosSymbol.tsx` — símbolo reutilizável
3. `app/index.tsx` — splash com lógica de roteamento
4. `app/onboarding.tsx` — 3 perguntas
5. `app/home.tsx` — direção do dia (tela mais importante)
6. `app/interaction.tsx` — botões + resposta da IA
7. `components/DeepModal.tsx` — segunda camada
8. `app/profile.tsx` — perfil e padrões

---

## Como usar este briefing no Cursor

Cole o seguinte no chat do Cursor antes de pedir cada tela:

```
Você está construindo o app Kairos — um app de direção espiritual diária com IA.
Leia o briefing em kairos_briefing.md antes de escrever qualquer código.
Use sempre a paleta de Colors de constants/colors.ts.
Use sempre o serviço de api.ts para chamadas ao backend.
Agora construa: [nome da tela]
```

---

## Observações para o Cursor

- **Nunca** hardcode cores — sempre usar `Colors.xxx` de `constants/colors.ts`
- **Nunca** chamar a API da IA diretamente do app — sempre via `services/api.ts` → backend
- Usar `SafeAreaView` em todas as telas
- Animações: usar `Animated` do React Native (sem bibliotecas externas por enquanto)
- Loading states: sempre implementar — a IA pode levar 2–4s para responder
- Tratar erros de rede: mostrar mensagem amigável, não crashar
