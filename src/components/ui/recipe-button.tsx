import React from "react";
import {
  Pressable,
  Text,
  StyleSheet,
} from "react-native";

type RecipeButtonProps = {
  title: string;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  onPress: () => void;
};

export default function RecipeButton({
  title,
  variant = "primary",
  disabled = false,
  onPress,
}: RecipeButtonProps) {
  const secondary = variant === "secondary";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        secondary ? styles.secondary : styles.primary,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text
        style={[
          styles.text,
          secondary && styles.secondaryText,
          disabled && styles.disabledText,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    paddingHorizontal: 24,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#DCCFB8",
  },
  primary: {
    backgroundColor: "#506B5D",
  },
  secondary: {
    backgroundColor: "#FFF9ED",
  },
  text: {
    color: "#FFF9ED",
    fontSize: 15,
    fontWeight: "600",
  },
  secondaryText: {
    color: "#354F43",
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    backgroundColor: "#D8D7CB",
  },
  disabledText: {
    color: "#999999",
  },
});
