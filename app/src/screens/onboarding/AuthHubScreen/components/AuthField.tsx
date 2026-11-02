import React, { forwardRef, memo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AUTH_HUB } from '../../../../constants/authHubTheme';

type Props = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  secure?: boolean;
  autoCapitalize?: 'none' | 'words' | 'sentences';
  keyboardType?: 'default' | 'email-address';
  editable?: boolean;
  autoComplete?: TextInputProps['autoComplete'];
  textContentType?: TextInputProps['textContentType'];
  returnKeyType?: TextInputProps['returnKeyType'];
  onSubmitEditing?: TextInputProps['onSubmitEditing'];
  blurOnSubmit?: TextInputProps['blurOnSubmit'];
  spellCheck?: TextInputProps['spellCheck'];
  importantForAutofill?: TextInputProps['importantForAutofill'];
};

export const AuthField = memo(forwardRef<TextInput, Props>(function AuthField({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  secure,
  autoCapitalize = 'none',
  keyboardType = 'default',
  editable = true,
  autoComplete,
  textContentType,
  returnKeyType,
  onSubmitEditing,
  blurOnSubmit,
  spellCheck = false,
  importantForAutofill,
}: Props, ref) {
  const [focused, setFocused] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.row, focused && styles.rowFocused]}>
        <MaterialCommunityIcons name={icon} size={20} color={AUTH_HUB.textMuted} style={styles.leadIcon} />
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={AUTH_HUB.textDim}
          style={styles.input}
          secureTextEntry={secure && !showPwd}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          autoComplete={autoComplete}
          spellCheck={spellCheck}
          importantForAutofill={importantForAutofill}
          keyboardType={keyboardType}
          textContentType={textContentType}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={blurOnSubmit}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          editable={editable}
          selectionColor={AUTH_HUB.electric}
        />
        {secure ? (
          <Pressable
            onPress={() => setShowPwd((v) => !v)}
            hitSlop={10}
            accessibilityLabel={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            <MaterialCommunityIcons
              name={showPwd ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={AUTH_HUB.textMuted}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}));

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: AUTH_HUB.textMuted,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderRadius: AUTH_HUB.radiusInput,
    borderWidth: 1,
    borderColor: AUTH_HUB.inputBorder,
    backgroundColor: AUTH_HUB.inputBg,
    paddingHorizontal: 14,
  },
  rowFocused: {
    borderColor: AUTH_HUB.inputFocus,
    shadowColor: AUTH_HUB.electric,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  leadIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: AUTH_HUB.text,
    paddingVertical: 12,
  },
});
