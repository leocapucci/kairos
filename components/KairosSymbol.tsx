import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '../theme';

type KairosSymbolProps = {
  size?: number;
  color?: string;
};

export function KairosSymbol({ size = 80, color = colors.textSecondary }: KairosSymbolProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <Path
        d="M40 8 C56 8, 72 22, 72 40 C72 58, 57 72, 40 72 C23 72, 8 57.5, 8 40 C8 23, 22 8, 40 8 Z"
        fill="none"
        stroke={color}
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeDasharray="195 8"
      />
      <Circle cx="40" cy="40" r="4.5" fill={colors.gold} />
      <Circle cx="40" cy="40" r="2" fill={colors.background} />
    </Svg>
  );
}

export default KairosSymbol;
