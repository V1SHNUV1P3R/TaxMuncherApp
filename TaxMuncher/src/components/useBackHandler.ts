import { usePreventRemove, useNavigation } from "expo-router/react-navigation";
import { Alert, Platform } from "react-native";
import { RefObject } from "react";
export function useBackHandler(
  isDirty: boolean,
  isSavingRef: RefObject<boolean>,
) {
  const navigation = useNavigation();
  usePreventRemove(isDirty, ({ data }) => {
    if (isSavingRef.current) {
      navigation.dispatch(data.action);
      return;
    }
    if (Platform.OS === "web") {
      if (window.confirm("Discard unsaved receipt changes?"))
        navigation.dispatch(data.action);
      return;
    }
    Alert.alert("Discard changes?", "Your unsaved changes will be lost.", [
      { text: "Keep editing", style: "cancel" },
      {
        text: "Discard",
        style: "destructive",
        onPress: () => navigation.dispatch(data.action),
      },
    ]);
  });
}
