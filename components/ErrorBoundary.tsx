import React, { Component, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { hasError: boolean; error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Sentry (when configured) will pick this up via its own boundary.
    // Log locally so the error is never silent.
    console.error('[kairos][ErrorBoundary]', error.message, info.componentStack);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>⚠️</Text>
        <Text style={styles.title}>Algo saiu errado</Text>
        <Text style={styles.message}>
          {this.state.error?.message ?? 'Erro desconhecido'}
        </Text>
        <Pressable
          onPress={this.reset}
          style={({ pressed }) => [styles.btn, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.btnText}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  emoji: { fontSize: 40 },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  message: {
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 22,
  },
  btn: {
    marginTop: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
  },
  btnText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
});
