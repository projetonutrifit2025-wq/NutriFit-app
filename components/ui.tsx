import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'danger';
  loading?: boolean;
}

export const Button = ({ title, onPress, variant = 'primary', loading }: ButtonProps) => {
  const bg = variant === 'primary' ? COLORS.primary : variant === 'danger' ? COLORS.error : 'transparent';
  const text = variant === 'outline' ? COLORS.primary : '#FFF';
  const border = variant === 'outline' ? 1 : 0;

  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: bg, borderWidth: border, borderColor: COLORS.primary }]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? <ActivityIndicator color="#FFF" /> : (
        <Text style={[styles.btnText, { color: text }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

interface InputProps extends React.ComponentProps<typeof TextInput> {
  label?: string;
  icon?: React.ReactNode;
}

export const Input = ({ label, icon, style, ...props }: InputProps) => {
  return (
    <View style={{ marginBottom: 12 }}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        {icon && <View style={styles.iconBox}>{icon}</View>}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={COLORS.textLight}
          {...props}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 8,
    ...SHADOWS.small,
  },
  btnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
  },
  iconBox: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    marginLeft: 4,
  },
});