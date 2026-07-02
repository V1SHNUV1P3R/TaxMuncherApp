import { Text, View, Alert} from "react-native";
import colors from "../styles/colors";
import defaultStyles from "../styles/defaultStyles"
import Button from "../components/MyButton";
import { usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AppHeader from "../components/AppHeader";
import ImagePickerExample from "../components/imagePickerEXAMPLE";
import ProgressBar from "../components/progressBar";
import { useState } from "react";
import router from "expo-router";
import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";




export default function Index() {
  return (
    <View style={defaultStyles.screen}>
      <Text>Edit src/app/index.tsx to edit this screen.</Text>
    </View>
  );
}
