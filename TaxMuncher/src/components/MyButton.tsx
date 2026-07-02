import React from "react";
import { Text, TouchableHighlight, View } from "react-native";
import defaultStyles from "../styles/defaultStyles";

type propsType = {
  title: string;
  color?: string;
  textColor?: string;
  underlayColor?: string;
  onPress?: () => void;
  onoff?: boolean; // Optional on/off state
  icon?: React.ReactNode; // Optional icon prop
  disabled?: boolean; // Optional disabled state
};

const MyButton: React.FC<propsType> = ({
  title,
  color,
  textColor,
  underlayColor = "darkblue",
  onPress,
  icon,
  disabled,
}) => {
  return (
    <View>
      <TouchableHighlight
        style={[
          defaultStyles.primaryButton,
          color && { backgroundColor: color },
          disabled && { opacity: 0.5 }, // 👈 visual feedback
        ]}
        underlayColor={underlayColor}
        onPress={disabled ? undefined : onPress} // 👈 extra safety
        disabled={disabled}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
          <Text
            style={[
              defaultStyles.buttonText,
              textColor && { color: textColor },
            ]}
          >
            {title}
          </Text>
        </View>
      </TouchableHighlight>
    </View>
  );
};

export default MyButton;