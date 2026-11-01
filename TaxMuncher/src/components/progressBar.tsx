import * as React from "react";
import { ProgressBar } from "react-native-paper";
import { View } from "react-native";

type propsType = {
  color?: string;
  progress: number;
};

//This code comes from the React Native Paper documentation,
// I've listed it as "React native Progress bar" in my Works Cited.
// const MyComponent = () => (
//   <ProgressBar
//   progress={0.5}
//   color={MD3Colors.error50}
//   />
// );

// Be advised, the progressBar only accepts values from 0 to 1, so if you want to use it with a percentage,
// you will need to divide the percentage by 100 before passing it to the progressBar.
const progressBar: React.FC<propsType> = ({ color, progress }) => {
  return (
    <View>
      <ProgressBar progress={progress} color={color} />
    </View>
  );
};

export default progressBar;
