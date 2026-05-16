import { Share, Platform, Alert } from 'react-native';

const APP_LINK = 'https://kairos-six-chi.vercel.app';

function format(content: string) {
  const short = content?.length > 200 ? content.slice(0, 197) + '...' : content;

  return `${short}

— KAIROS
Direção diária pra sua vida

${APP_LINK}`;
}

export async function shareKairos(content: string) {
  try {
    const message = format(content);

    // Expo / React Native
    if (Platform.OS !== 'web') {
      const result = await Share.share({ message });

      // opcional: debug silencioso
      return result;
    }

    // Web share API
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({
        title: 'Kairos',
        text: message,
      });
      return;
    }

    // fallback web clipboard
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(message);
      return;
    }

    Alert.alert('Compartilhar', 'Não foi possível compartilhar neste dispositivo.');
  } catch (e) {
    console.log('[shareKairos error]', e);
  }
}