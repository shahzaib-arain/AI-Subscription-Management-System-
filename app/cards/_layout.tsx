import { Stack } from "expo-router";
import { TouchableOpacity, StyleSheet } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function CardsLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#0d0e12",
        },
        headerTintColor: "#fcfcfc",
        headerTitleStyle: {
          fontFamily: "Manrope_700Bold",
          fontSize: 18,
        },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: "#0d0e12" },
        headerLeft: () => (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color="#fcfcfc" />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "Payment Methods",
        }} 
      />
      <Stack.Screen 
        name="add" 
        options={{ 
          title: "Add Card",
        }} 
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  backButton: {
    padding: 8,
    marginLeft: -8,
  }
});
