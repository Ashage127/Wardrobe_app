import { useMemo, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { useRouter } from "expo-router";

import { useWardrobe } from "../context/WardrobeContext";
import type { ClothingItem } from "../types/clothing";

const categories = [
  "All",
  "Tops",
  "Bottoms",
  "Shoes",
  "Outerwear",
  "Accessories",
];

export default function WardrobeScreen() {
  const router =
    useRouter();

  const {
    clothes,
    loading,
  } = useWardrobe();

  const {
    width,
  } = useWindowDimensions();

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("All");

  const columns =
    width >= 1200
      ? 4
      : width >= 850
        ? 3
        : 2;

  const filteredClothes =
    useMemo(() => {
      if (
        selectedCategory ===
        "All"
      ) {
        return clothes;
      }

      return clothes.filter(
        (item) =>
          item.category ===
          selectedCategory
      );
    }, [
      clothes,
      selectedCategory,
    ]);

  function formatValue(
    item: ClothingItem
  ) {
    const low =
      item.estimatedValueLowEUR;

    const high =
      item.estimatedValueHighEUR;

    if (
      typeof low !==
        "number" &&
      typeof high !==
        "number"
    ) {
      return null;
    }

    if (
      typeof low ===
        "number" &&
      typeof high ===
        "number"
    ) {
      if (low === high) {
        return `€${low}`;
      }

      return `€${low}–€${high}`;
    }

    if (
      typeof low ===
      "number"
    ) {
      return `€${low}`;
    }

    return `€${high}`;
  }

  function renderItem({
    item,
  }: {
    item: ClothingItem;
  }) {
    const value =
      formatValue(item);

    return (
      <Pressable
        style={
          styles.cardWrapper
        }
        onPress={() =>
          router.push({
            pathname:
              "/item/[id]",

            params: {
              id:
                item.id,
            },
          })
        }
      >
        <View
          style={
            styles.card
          }
        >
          <View
            style={
              styles.imageContainer
            }
          >
            <Image
              source={{
                uri:
                  item.image,
              }}
              style={
                styles.cardImage
              }
              resizeMode="cover"
            />

            {value && (
              <View
                style={
                  styles.valueBadge
                }
              >
                <Text
                  style={
                    styles.valueBadgeText
                  }
                >
                  {value}
                </Text>
              </View>
            )}
          </View>

          <View
            style={
              styles.cardInfo
            }
          >
            <Text
              style={
                styles.cardName
              }
              numberOfLines={
                1
              }
            >
              {item.name}
            </Text>

            <Text
              style={
                styles.cardCategory
              }
            >
              {item.category}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  }

  if (loading) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="large"
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Loading wardrobe...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={
        styles.screen
      }
    >
      <FlatList
        key={
          columns
        }
        data={
          filteredClothes
        }
        numColumns={
          columns
        }
        keyExtractor={(
          item
        ) =>
          item.id
        }
        renderItem={
          renderItem
        }
        columnWrapperStyle={
          columns > 1
            ? styles.row
            : undefined
        }
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
        ListHeaderComponent={
          <>
            <View
              style={
                styles.header
              }
            >
              <View>
                <Text
                  style={
                    styles.title
                  }
                >
                  Wardrobe
                </Text>

                <Text
                  style={
                    styles.subtitle
                  }
                >
                  {clothes.length}{" "}
                  {clothes.length ===
                  1
                    ? "item"
                    : "items"}
                </Text>
              </View>
            </View>

            <View
              style={
                styles.actionButtons
              }
            >
              <Pressable
                style={
                  styles.outfitButton
                }
                onPress={() =>
                  router.push(
                    "/outfit-builder"
                  )
                }
              >
                <Text
                  style={
                    styles.outfitButtonText
                  }
                >
                  Create outfit
                </Text>
              </Pressable>

              <Pressable
                style={
                  styles.scanButton
                }
                onPress={() =>
                  router.push(
                    "/scan-value"
                  )
                }
              >
                <Text
                  style={
                    styles.scanButtonText
                  }
                >
                  Scan value
                </Text>
              </Pressable>

              <Pressable
                style={
                  styles.addButton
                }
                onPress={() =>
                  router.push(
                    "/add-item"
                  )
                }
              >
                <Text
                  style={
                    styles.addButtonText
                  }
                >
                  + Add item
                </Text>
              </Pressable>
            </View>

            <View
              style={
                styles.categoryContainer
              }
            >
              {categories.map(
                (
                  category
                ) => {
                  const active =
                    selectedCategory ===
                    category;

                  return (
                    <Pressable
                      key={
                        category
                      }
                      style={[
                        styles.categoryChip,

                        active &&
                          styles.categoryChipActive,
                      ]}
                      onPress={() =>
                        setSelectedCategory(
                          category
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.categoryText,

                          active &&
                            styles.categoryTextActive,
                        ]}
                      >
                        {category}
                      </Text>
                    </Pressable>
                  );
                }
              )}
            </View>

            {filteredClothes.length >
              0 && (
              <Text
                style={
                  styles.sectionTitle
                }
              >
                {selectedCategory ===
                "All"
                  ? "Your items"
                  : selectedCategory}
              </Text>
            )}
          </>
        }
        ListEmptyComponent={
          <View
            style={
              styles.emptyContainer
            }
          >
            <Text
              style={
                styles.emptyTitle
              }
            >
              {clothes.length ===
              0
                ? "Your wardrobe is empty"
                : "No items here"}
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              {clothes.length ===
              0
                ? "Add an item or scan something while thrifting."
                : "Try another category."}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,

      backgroundColor:
        "#FFFFFF",
    },

    content: {
      width: "100%",

      maxWidth: 1300,

      alignSelf:
        "center",

      paddingHorizontal: 18,

      paddingTop: 24,
      paddingBottom: 60,
    },

    header: {
      flexDirection: "row",

      justifyContent:
        "space-between",

      alignItems: "center",

      marginBottom: 20,
    },

    title: {
      fontSize: 32,

      fontWeight: "900",

      color: "#111111",
    },

    subtitle: {
      marginTop: 5,

      fontSize: 14,

      color: "#777777",
    },

    actionButtons: {
      flexDirection: "row",

      flexWrap: "wrap",

      gap: 10,

      marginBottom: 22,
    },

    outfitButton: {
      minHeight: 48,

      paddingHorizontal: 18,

      borderRadius: 14,

      borderWidth: 1,

      borderColor:
        "#D9D9D9",

      alignItems: "center",
      justifyContent:
        "center",

      backgroundColor:
        "#FFFFFF",
    },

    outfitButtonText: {
      fontSize: 14,

      fontWeight: "700",

      color: "#111111",
    },

    scanButton: {
      minHeight: 48,

      paddingHorizontal: 18,

      borderRadius: 14,

      backgroundColor:
        "#EDEDED",

      alignItems: "center",
      justifyContent:
        "center",
    },

    scanButtonText: {
      fontSize: 14,

      fontWeight: "800",

      color: "#111111",
    },

    addButton: {
      minHeight: 48,

      paddingHorizontal: 18,

      borderRadius: 14,

      backgroundColor:
        "#111111",

      alignItems: "center",
      justifyContent:
        "center",
    },

    addButtonText: {
      fontSize: 14,

      fontWeight: "800",

      color: "#FFFFFF",
    },

    categoryContainer: {
      flexDirection: "row",

      flexWrap: "wrap",

      gap: 8,

      marginBottom: 25,
    },

    categoryChip: {
      paddingHorizontal: 14,

      paddingVertical: 9,

      borderRadius: 999,

      borderWidth: 1,

      borderColor:
        "#DDDDDD",

      backgroundColor:
        "#FFFFFF",
    },

    categoryChipActive: {
      backgroundColor:
        "#111111",

      borderColor:
        "#111111",
    },

    categoryText: {
      fontSize: 13,

      fontWeight: "600",

      color: "#444444",
    },

    categoryTextActive: {
      color: "#FFFFFF",
    },

    sectionTitle: {
      marginBottom: 13,

      fontSize: 20,

      fontWeight: "800",

      color: "#111111",
    },

    row: {
      gap: 12,
    },

    cardWrapper: {
      flex: 1,

      marginBottom: 16,
    },

    card: {
      flex: 1,

      overflow: "hidden",

      borderRadius: 17,

      backgroundColor:
        "#F5F5F5",
    },

    imageContainer: {
      width: "100%",

      aspectRatio: 4 / 5,

      position: "relative",

      backgroundColor:
        "#EEEEEE",
    },

    cardImage: {
      width: "100%",
      height: "100%",
    },

    valueBadge: {
      position: "absolute",

      top: 10,
      right: 10,

      paddingHorizontal: 9,

      paddingVertical: 6,

      borderRadius: 999,

      backgroundColor:
        "rgba(17,17,17,0.90)",
    },

    valueBadgeText: {
      color: "#FFFFFF",

      fontSize: 11,

      fontWeight: "800",
    },

    cardInfo: {
      paddingHorizontal: 12,
      paddingVertical: 12,

      backgroundColor:
        "#FFFFFF",
    },

    cardName: {
      fontSize: 15,

      fontWeight: "700",

      color: "#111111",
    },

    cardCategory: {
      marginTop: 3,

      fontSize: 12,

      color: "#777777",
    },

    emptyContainer: {
      paddingVertical: 70,

      alignItems: "center",
    },

    emptyTitle: {
      fontSize: 20,

      fontWeight: "800",

      color: "#111111",
    },

    emptyText: {
      marginTop: 8,

      fontSize: 14,

      textAlign: "center",

      color: "#777777",
    },

    loadingContainer: {
      flex: 1,

      alignItems: "center",
      justifyContent:
        "center",

      backgroundColor:
        "#FFFFFF",
    },

    loadingText: {
      marginTop: 12,

      color: "#666666",
    },
  });