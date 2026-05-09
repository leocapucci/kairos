# KAIROS — Contexto do Projeto

## Stack
- Expo Router ~6.0
- React Native 0.81
- TypeScript
- Backend: https://kairos-backend-vjdp.onrender.com

## Rotas
/ → index.tsx (redireciona)
/onboarding → onboarding.tsx
/home → home.tsx
/bible → bible.tsx
/books → books.tsx
/chapters → chapters.tsx
/verses → verses.tsx
/verse-experience → verse-experience.tsx
/conversations → conversations.tsx
/interaction → interaction.tsx
/plans → plans.tsx
/profile → profile.tsx

## Design System (theme/index.ts)
background: #F7F5F2
backgroundSecondary: #EFEBDE
textPrimary: #2D261F
textSecondary: #6E675F
sage: #7A9E7E
gold: #C8A46B
accent: #C84C4C
borderSoft: #E8E3DC

## Funcionalidades prontas
- Direção diária com IA (cards Conforto/Confronto)
- Bíblia navegável (livros → capítulos → versículos)
- Busca de versículos
- Interação com IA em qualquer versículo (Meditação/Confronto/Oração)
- Conversas livres com IA
- Planos devocionais com IA
- Perfil com padrão espiritual e streak
- Onboarding com 3 perguntas

## Funcionalidades pendentes
- Aba Salvos (UI existe, sem backend)
- Autenticação real (hoje usa device_id)
- Push notifications
- Tela de início (splash) sem duplicata no nativo

## Problema conhecido
- Splash screen duplica no Expo Go (Expo Router double render)
- Solução parcial: index.tsx redireciona direto, splash nativa no app.json
