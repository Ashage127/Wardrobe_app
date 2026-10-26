import { Stack } from "expo-router";

import { AuthProvider } from "../context/AuthContext";
import { WardrobeProvider } from "../context/WardrobeContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <WardrobeProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </WardrobeProvider>
    </AuthProvider>
  );
}