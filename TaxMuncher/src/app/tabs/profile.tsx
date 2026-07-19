// AI Assistance Used
// Tool: ChatGPT (OpenAI)
// Date: 4-2-26
// Link: https://chatgpt.com/share/69b9737e-28f8-8012-8ac6-88b5ce6edffc
// Purpose: Had it fix obscure issues while also cleaning up the code to make it
//  easier to read and maintain.
// Notes: Modified error handling and added validation after testing
import { useAuth } from "@/src/components/AuthProvider";
import MyButton from "@/src/components/MyButton";
import colors from "@/src/styles/colors";
import defaultStyles from "@/src/styles/defaultStyles";
import { supabase } from "@/utils/supabase";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// const background = require("../../assets/SFX/blooketcafetheme.mp3");
import * as ImagePicker from "expo-image-picker";

export default function ProfileScreen() {
  const { session } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [avatar, setAvatar] = useState<string | null>(null);
  // const backgroundMusic = useAudioPlayer(background);

  useEffect(() => {
    let ignore = false;

    async function loadProfile() {
      if (!session?.user) {
        if (!ignore) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from("Profiles")
        .select(
          `
                first_name,
                last_name,
                phone_number,
                avatar
                `,
        )
        .eq("id", session.user.id)
        .single();

      if (!ignore) {
        if (error) {
          console.warn(error);
        }

        setProfile(data);
        setLoading(false);
      }
    }

    loadProfile();

    return () => {
      ignore = true;
    };
  }, [session?.user?.id]);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }
  console.log("AVATAR VALUE:", profile?.avatar);

  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Required", "Please allow access to your photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  //AI Assistance Used
  // Tool: ChatGPT (OpenAI)
  // Date: 4-21-26
  // Link: https://chatgpt.com/share/69e79a6c-2dc4-83ea-a0fa-5ce11bf998f7
  // Purpose: Had it reformat the code for better design
  // Notes: Also helped fix the styling of the defaultStyles.tsx
  return (
    <View style={[defaultStyles.container, defaultStyles.center]}>
      {/* Title */}
      <Text style={defaultStyles.heroTitle}>Your Profile</Text>

      {/* Icon + label */}
      <View style={[defaultStyles.rowCenter, { marginBottom: 12 }]}>
        <Text style={[defaultStyles.body, { marginLeft: 8 }]}>It's you!</Text>

        <View style={{ alignItems: "center", marginBottom: 16 }}></View>
      </View>
      <Text style={[defaultStyles.body, { marginBottom: 6 }]}>
        Profile Picture
      </Text>

      <TouchableOpacity
        style={defaultStyles.avatarContainer}
        onPress={pickAvatar}
      >
        {avatar || profile?.avatar ? (
          <Image
            source={{
              uri: avatar ?? profile.avatar,
            }}
            style={defaultStyles.avatar}
          />
        ) : (
          <View style={[defaultStyles.avatar, defaultStyles.center]}>
            <FontAwesome6 name="user" size={50} color={colors.dark.primary} />
          </View>
        )}

        <Text style={defaultStyles.caption}>Change Profile Picture</Text>
      </TouchableOpacity>

      <View style={{ height: 24 }} />
      <View style={defaultStyles.screen}>
        <Text style={defaultStyles.caption}>Full Name</Text>

        <Text style={defaultStyles.body}>
          {profile?.first_name} {profile?.last_name}
        </Text>
      </View>

      <View style={defaultStyles.card}>
        <Text style={defaultStyles.caption}>Phone Number</Text>

        <Text style={defaultStyles.body}>
          {profile?.phone_number ?? "Not Added"}
        </Text>
      </View>

      <View style={defaultStyles.card}>
        <Text style={defaultStyles.caption}>Email</Text>

        <Text style={defaultStyles.body}>{session?.user.email}</Text>
      </View>

      <View style={{ marginTop: 20 }}>
        <MyButton
          title="Edit Profile"
          onPress={() => router.push({ pathname: "/settings" } as any)}
          icon={
            <FontAwesome6 name="pen" size={16} color={colors.dark.buttonText} />
          }
        />
      </View>
    </View>
  );
}
