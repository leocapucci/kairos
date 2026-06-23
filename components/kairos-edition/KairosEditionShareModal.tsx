import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme';

export type ShareDestination = 'stories' | 'whatsapp' | 'save' | 'more';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (dest: ShareDestination) => void;
};

type Option = {
  dest: ShareDestination;
  label: string;
  sub: string;
  abbr: string;
  bg: string;
};

const OPTIONS: Option[] = [
  { dest: 'stories', label: 'Instagram Stories', sub: 'Compartilhar como story', abbr: 'IG', bg: '#833AB4' },
  { dest: 'whatsapp', label: 'WhatsApp Status', sub: 'Compartilhar no status', abbr: 'WA', bg: '#25D366' },
  { dest: 'save', label: 'Salvar imagem', sub: 'Salvar na galeria', abbr: '↓', bg: '#1A73E8' },
  { dest: 'more', label: 'Mais opções', sub: 'Outros aplicativos', abbr: '···', bg: '#555555' },
];

export default function KairosEditionShareModal({ visible, onClose, onSelect }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.sheet}>
        <View style={styles.handle} />

        <Text style={styles.title}>Compartilhar</Text>
        <Text style={styles.subtitle}>Uma coleção premium diária feita para compartilhar</Text>

        <View style={styles.options}>
          {OPTIONS.map((opt) => (
            <Pressable
              key={opt.dest}
              onPress={() => {
                // ANALYTICS: share_destination_tapped { destination: opt.dest }
                onSelect(opt.dest);
              }}
              style={({ pressed }) => [styles.option, pressed && { opacity: 0.7 }]}
            >
              <View style={[styles.iconBox, { backgroundColor: opt.bg }]}>
                <Text style={styles.iconText}>{opt.abbr}</Text>
              </View>
              <View style={styles.optTexts}>
                <Text style={styles.optLabel}>{opt.label}</Text>
                <Text style={styles.optSub}>{opt.sub}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={onClose}
          style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.cancelText}>Cancelar</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 36,
    paddingHorizontal: 20,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderSoft,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
    marginBottom: 24,
    letterSpacing: 0.2,
  },
  options: {
    gap: 4,
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
  optTexts: {
    flex: 1,
    gap: 2,
  },
  optLabel: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: colors.textPrimary,
  },
  optSub: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  cancelText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
  },
});
