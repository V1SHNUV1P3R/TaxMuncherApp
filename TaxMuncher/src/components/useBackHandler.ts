import { useEffect } from "react";
import { Alert } from "react-native";
import { useNavigation } from "expo-router";

// Make sure both arguments are defined in the function signature here:
export function useBackHandler(
  isDirty: boolean, 
  isSavingRef: React.MutableRefObject<boolean>
) {
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      // If nothing changed OR we are in the middle of a valid save, let them leave
      if (!isDirty || isSavingRef.current) {
        return;
      }

      // Block the back transition
      e.preventDefault();

      Alert.alert(
        "Are you sure you want to exit?",
        "This will discard changes.",
        [
          { text: "Stay", style: "cancel", onPress: () => {} },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, isDirty, isSavingRef]);
}