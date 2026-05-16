import React, { useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '../../src/design-system';
import { colors, spacing } from '../../theme';

// Context map keyed by "Book Chapter:Verse" — supports both Portuguese and English book names
// so the component works regardless of which form is passed from the API or normalized locally.
const VERSE_CONTEXTS: Record<string, string> = {
  'João 3:16': 'Jesus falava com Nicodemos, um líder religioso que veio encontrá-lo de noite. Em meio a uma conversa sobre o novo nascimento, Jesus revelou o coração do plano eterno de Deus — não julgamento, mas resgate.',
  'John 3:16': 'Jesus falava com Nicodemos, um líder religioso que veio encontrá-lo de noite. Em meio a uma conversa sobre o novo nascimento, Jesus revelou o coração do plano eterno de Deus — não julgamento, mas resgate.',

  'Romanos 8:28': 'Paulo escrevia às igrejas em Roma sob pressão do Império. Mesmo diante da perseguição e do sofrimento dos cristãos, ele afirmava uma verdade que vai além das circunstâncias: Deus trabalha todas as coisas para o bem daqueles que o amam.',
  'Romans 8:28': 'Paulo escrevia às igrejas em Roma sob pressão do Império. Mesmo diante da perseguição e do sofrimento dos cristãos, ele afirmava uma verdade que vai além das circunstâncias: Deus trabalha todas as coisas para o bem daqueles que o amam.',

  'Salmos 23:1': 'Davi escreveu este salmo carregando memórias dos campos onde pastoreava ovelhas. Ele conhecia o que um bom pastor faz — guia, protege, provê. Ao olhar para Deus, reconheceu nEle o mesmo cuidado que um dia exerceu nos pastos.',
  'Psalms 23:1': 'Davi escreveu este salmo carregando memórias dos campos onde pastoreava ovelhas. Ele conhecia o que um bom pastor faz — guia, protege, provê. Ao olhar para Deus, reconheceu nEle o mesmo cuidado que um dia exerceu nos pastos.',

  'Filipenses 4:13': 'Paulo escreveu esta carta da prisão em Roma, acorrentado a um soldado. Paradoxalmente, ele falava de contentamento e força. Essa declaração não vinha de triunfo — vinha de alguém que havia aprendido a confiar em meio à adversidade real.',
  'Philippians 4:13': 'Paulo escreveu esta carta da prisão em Roma, acorrentado a um soldado. Paradoxalmente, ele falava de contentamento e força. Essa declaração não vinha de triunfo — vinha de alguém que havia aprendido a confiar em meio à adversidade real.',

  'Jeremias 29:11': 'Jeremias entregou esta mensagem a israelitas exilados na Babilônia. Eles haviam perdido tudo — terra, templo, identidade. Mas Deus falou através do profeta: a esperança não havia terminado. O exílio era temporário; o plano, permanente.',
  'Jeremiah 29:11': 'Jeremias entregou esta mensagem a israelitas exilados na Babilônia. Eles haviam perdido tudo — terra, templo, identidade. Mas Deus falou através do profeta: a esperança não havia terminado. O exílio era temporário; o plano, permanente.',

  'Isaías 40:31': 'Isaías profetizava a um povo exausto, prestes a enfrentar o exílio. A pergunta pairava no ar: Deus ainda se importa? A resposta era uma imagem de renovação — aqueles que esperam no Senhor encontram uma força que não é deles próprios.',
  'Isaiah 40:31': 'Isaías profetizava a um povo exausto, prestes a enfrentar o exílio. A pergunta pairava no ar: Deus ainda se importa? A resposta era uma imagem de renovação — aqueles que esperam no Senhor encontram uma força que não é deles próprios.',

  'Isaías 41:10': 'Deus falava a Israel em um momento de crise nacional, encurralado pelo medo das nações vizinhas. Essa promessa não era abstrata — era específica: "Não tema, pois eu estou com você." A presença de Deus era a resposta direta ao medo do povo.',
  'Isaiah 41:10': 'Deus falava a Israel em um momento de crise nacional, encurralado pelo medo das nações vizinhas. Essa promessa não era abstrata — era específica: "Não tema, pois eu estou com você." A presença de Deus era a resposta direta ao medo do povo.',

  'Mateus 6:33': 'Jesus ensinava no Sermão do Monte, dirigindo-se a pessoas comuns preocupadas com sustento e o amanhã. Sua instrução invertia a lógica humana: buscar primeiro o reino não é ingenuidade — é a reordenação de prioridades que transforma toda a vida.',
  'Matthew 6:33': 'Jesus ensinava no Sermão do Monte, dirigindo-se a pessoas comuns preocupadas com sustento e o amanhã. Sua instrução invertia a lógica humana: buscar primeiro o reino não é ingenuidade — é a reordenação de prioridades que transforma toda a vida.',

  'Provérbios 3:5': 'Salomão escreveu estes provérbios para ensinar sabedoria a seu povo. Em uma cultura que valorizava a astúcia humana, ele apontou para algo mais profundo: a verdadeira inteligência começa reconhecendo os próprios limites e confiando no caráter de Deus.',
  'Proverbs 3:5': 'Salomão escreveu estes provérbios para ensinar sabedoria a seu povo. Em uma cultura que valorizava a astúcia humana, ele apontou para algo mais profundo: a verdadeira inteligência começa reconhecendo os próprios limites e confiando no caráter de Deus.',

  '1 Coríntios 13:4': 'Paulo respondia aos problemas da igreja em Corinto — marcada por divisões, competição e vaidade. Em meio ao caos, ele apresentou o amor não como sentimento, mas como comportamento: uma escolha concreta, cotidiana e profundamente contracultural.',
  '1 Corinthians 13:4': 'Paulo respondia aos problemas da igreja em Corinto — marcada por divisões, competição e vaidade. Em meio ao caos, ele apresentou o amor não como sentimento, mas como comportamento: uma escolha concreta, cotidiana e profundamente contracultural.',

  'Salmos 46:10': 'Este salmo foi composto em meio a ameaças de invasão. As nações tremiam, o caos circundava Israel. E no coração da crise, uma voz: "Aquietai-vos e sabei que eu sou Deus." Parar não era fraqueza — era confiança radical quando o mundo desmoronava.',
  'Psalms 46:10': 'Este salmo foi composto em meio a ameaças de invasão. As nações tremiam, o caos circundava Israel. E no coração da crise, uma voz: "Aquietai-vos e sabei que eu sou Deus." Parar não era fraqueza — era confiança radical quando o mundo desmoronava.',

  'Atos 2:42': 'Depois de Pentecostes, milhares creram em poucas horas. O que fizeram com isso? Se reuniram. Este versículo descreve a primeira comunidade cristã da história — pessoas que reconheceram que a fé não é individual, mas vivida e sustentada em conjunto.',
  'Acts 2:42': 'Depois de Pentecostes, milhares creram em poucas horas. O que fizeram com isso? Se reuniram. Este versículo descreve a primeira comunidade cristã da história — pessoas que reconheceram que a fé não é individual, mas vivida e sustentada em conjunto.',
};

type Props = {
  verseRef: string;
};

export default function VerseContextBlock({ verseRef }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;

  const context = VERSE_CONTEXTS[verseRef] ?? null;

  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }
    setIsOpen(true);
    opacity.setValue(0);
    Animated.timing(opacity, { toValue: 1, duration: 280, useNativeDriver: true }).start();
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={handleToggle} style={({ pressed }) => [styles.trigger, pressed && styles.triggerPressed]}>
        <Text style={styles.triggerText}>
          {isOpen ? 'Fechar contexto' : 'Entender contexto ✨'}
        </Text>
      </Pressable>

      {isOpen && (
        <Animated.View style={{ opacity }}>
          <Card variant="beige" padding="lg" style={styles.card}>
            <Text style={styles.label}>CONTEXTO HISTÓRICO</Text>
            <Text style={styles.text}>
              {context ?? 'Esse contexto estará disponível em breve.'}
            </Text>
          </Card>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
  },
  trigger: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  triggerPressed: {
    opacity: 0.6,
  },
  triggerText: {
    color: colors.sage,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.3,
  },
  card: {
    marginTop: spacing.sm,
  },
  label: {
    color: colors.sage,
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 2.5,
    marginBottom: 14,
  },
  text: {
    color: colors.blackSoft,
    fontSize: 15,
    lineHeight: 26,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.1,
  },
});
