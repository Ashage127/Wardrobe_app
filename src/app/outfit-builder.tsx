import { useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ScrollView,
  Modal,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";

import { useWardrobe } from "../context/WardrobeContext";
import type { ClothingItem } from "../types/clothing";

type OutfitSlot = "Tops" | "Bottoms" | "Shoes";

export default function OutfitBuilderScreen() {
  const router = useRouter();
  const { clothes } = useWardrobe();

  const [selectedTop, setSelectedTop] =
    useState<ClothingItem | null>(null);

  const [selectedBottom, setSelectedBottom] =
    useState<ClothingItem | null>(null);

  const [selectedShoes, setSelectedShoes] =
    useState<ClothingItem | null>(null);

  const [activeSlot, setActiveSlot] =
    useState<OutfitSlot | null>(null);

  const filteredItems = activeSlot
    ? clothes.filter(
        (item) => item.category === activeSlot
      )
    : [];

  function openPicker(slot: OutfitSlot) {
    setActiveSlot(slot);
  }

  function closePicker() {
    setActiveSlot(null);
  }

  function handleSelectItem(item: ClothingItem) {
  if (activeSlot === "Tops") {
    setSelectedTop(item);
  }

  if (activeSlot === "Bottoms") {
    setSelectedBottom(item);
  }

  if (activeSlot === "Shoes") {
    setSelectedShoes(item);
  }

  closePicker();
}
 function renderSlot(
  label: string,
  slot: OutfitSlot,
  item: ClothingItem | null
) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>
        {label}
      </Text>

      <Pressable
        style={styles.slot}
        onPress={() => openPicker(slot)}
      >
        {item ? (
          <>
            <Image
              source={{ uri: item.image }}
              style={styles.slotImage}
            />

            <View style={styles.slotInfo}>
              <Text style={styles.itemName}>
                {item.name}
              </Text>

              <Text style={styles.changeText}>
                Tap to change
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.emptySlot}>
            <Text style={styles.plus}>+</Text>

            <Text style={styles.chooseText}>
              Choose {label.toLowerCase()}
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}
  return (
    <View style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
          >
            <Text style={styles.back}>
              ← Back
            </Text>
          </Pressable>

          <Text style={styles.eyebrow}>
            OUTFIT BUILDER
          </Text>

          <Text style={styles.title}>
            Create Outfit
          </Text>

          <Text style={styles.subtitle}>
            Pick pieces from your wardrobe.
          </Text>
        </View>

        {renderSlot(
          "Top",
          "Tops",
          selectedTop
        )}

        {renderSlot(
          "Bottom",
          "Bottoms",
          selectedBottom
        )}

        {renderSlot(
          "Shoes",
          "Shoes",
          selectedShoes
        )}
      </ScrollView>

      <Modal
        visible={activeSlot !== null}
        animationType="slide"
        transparent
        onRequestClose={closePicker}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalEyebrow}>
                  YOUR WARDROBE
                </Text>

                <Text style={styles.modalTitle}>
                  Choose {activeSlot}
                </Text>
              </View>

              <Pressable
                style={styles.closeButton}
                onPress={closePicker}
              >
                <Text style={styles.closeText}>
                  ×
                </Text>
              </Pressable>
            </View>

            <FlatList
              data={filteredItems}
              numColumns={2}
              keyExtractor={(item) =>
                item.id
              }
              contentContainerStyle={
                styles.itemGrid
              }
              columnWrapperStyle={
                styles.gridRow
              }
              ListEmptyComponent={
                <View style={styles.emptyWardrobe}>
                  <Text
                    style={
                      styles.emptyWardrobeTitle
                    }
                  >
                    No items found
                  </Text>

                  <Text
                    style={
                      styles.emptyWardrobeText
                    }
                  >
                    Add some {activeSlot} to
                    your wardrobe first.
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <Pressable
                  style={styles.itemCard}
                  onPress={() =>
                    handleSelectItem(item)
                  }
                >
                  <Image
                    source={{
                      uri: item.image,
                    }}
                    style={
                      styles.itemCardImage
                    }
                  />

                  <Text
                    style={
                      styles.itemCardName
                    }
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F7F7F5",
  },

  content: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 60,
  },

  header: {
    marginBottom: 24,
  },

  back: {
    fontSize: 15,
    fontWeight: "600",
    color: "#444444",
    marginBottom: 28,
  },

  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.6,
    color: "#888888",
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111111",
    marginTop: 6,
  },

  subtitle: {
    fontSize: 14,
    color: "#777777",
    marginTop: 6,
  },

  section: {
    marginTop: 22,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.3,
    color: "#777777",
    marginBottom: 9,
    textTransform: "uppercase",
  },

  slot: {
    minHeight: 190,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E2E2DE",
    overflow: "hidden",
  },

  emptySlot: {
    minHeight: 190,
    alignItems: "center",
    justifyContent: "center",
  },

  plus: {
    fontSize: 34,
    fontWeight: "300",
    color: "#777777",
  },

  chooseText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#777777",
    marginTop: 5,
  },

  slotImage: {
    width: "100%",
    height: 260,
    resizeMode: "cover",
  },

  slotInfo: {
    padding: 15,
  },

  itemName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111111",
  },

  changeText: {
    fontSize: 13,
    color: "#888888",
    marginTop: 3,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor:
      "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },

  modal: {
    width: "100%",
    maxHeight: "85%",
    backgroundColor: "#F7F7F5",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 22,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  modalEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: "#888888",
  },

  modalTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111111",
    marginTop: 4,
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E6E6E2",
    alignItems: "center",
    justifyContent: "center",
  },

  closeText: {
    fontSize: 28,
    fontWeight: "300",
    color: "#111111",
    lineHeight: 30,
  },

  itemGrid: {
    paddingHorizontal: 13,
    paddingBottom: 50,
  },

  gridRow: {
    alignItems: "flex-start",
  },

  itemCard: {
    width: "50%",
    paddingHorizontal: 7,
    marginBottom: 20,
  },

  itemCardImage: {
    width: "100%",
    aspectRatio: 4 / 5,
    borderRadius: 18,
    backgroundColor: "#EAEAE7",
    resizeMode: "cover",
  },

  itemCardName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111111",
    marginTop: 8,
  },

  emptyWardrobe: {
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 20,
  },

  emptyWardrobeTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111111",
  },

  emptyWardrobeText: {
    fontSize: 14,
    color: "#777777",
    textAlign: "center",
    marginTop: 6,
  },
});