import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

import { Redirect } from "expo-router";

import WardrobeScreen from "../screens/WardrobeScreen";
import { useAuth } from "../context/AuthContext";

export default function HomeScreen() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#111111"
        />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/auth" />;
  }

  return <WardrobeScreen />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F7F5",
  },
});