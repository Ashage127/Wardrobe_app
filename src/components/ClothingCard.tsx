import { Image, Pressable, Text, StyleSheet } from "react-native";
import type { ClothingItem } from "../types/clothing";

type Props = {
  item: ClothingItem;
  onPress: () => void;
};

export default function ClothingCard({ item, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Image
        source={{ uri: item.image }}
        style={styles.image}
      />

      <Text style={styles.name}>
        {item.name}
      </Text>

      <Text style={styles.category}>
        {item.category}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
  },

  image: {
    width: "100%",
    height: 180,
    borderRadius: 12,
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },

  category: {
    fontSize: 13,
    marginTop: 2,
    opacity: 0.6,
  },
});