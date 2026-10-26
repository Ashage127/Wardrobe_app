import { useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import { useWardrobe } from "../../context/WardrobeContext";

type DetailRowProps = {
  label: string;

  value?:
    | string
    | string[]
    | number
    | null;
};

function DetailRow({
  label,
  value,
}: DetailRowProps) {
  let displayValue = "";

  if (Array.isArray(value)) {
    displayValue = value
      .filter(Boolean)
      .join(", ");
  } else if (
    typeof value === "number"
  ) {
    displayValue = String(value);
  } else if (
    typeof value === "string"
  ) {
    displayValue = value.trim();
  }

  if (!displayValue) {
    return null;
  }

  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>
        {label}
      </Text>

      <Text style={styles.detailValue}>
        {displayValue}
      </Text>
    </View>
  );
}

function isToday(
  dateValue?: string | null
) {
  if (!dateValue) {
    return false;
  }

  const date =
    new Date(dateValue);

  const now =
    new Date();

  return (
    date.getFullYear() ===
      now.getFullYear() &&
    date.getMonth() ===
      now.getMonth() &&
    date.getDate() ===
      now.getDate()
  );
}

function formatLastWorn(
  dateValue?: string | null
) {
  if (!dateValue) {
    return "Never";
  }

  const date =
    new Date(dateValue);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Never";
  }

  return date.toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
}

function formatEstimatedValue(
  low?: number | null,
  high?: number | null
) {
  const hasLow =
    typeof low === "number" &&
    Number.isFinite(low);

  const hasHigh =
    typeof high === "number" &&
    Number.isFinite(high);

  if (!hasLow && !hasHigh) {
    return null;
  }

  if (
    hasLow &&
    hasHigh
  ) {
    if (low === high) {
      return `€${low}`;
    }

    return `€${low} – €${high}`;
  }

  if (hasLow) {
    return `€${low}`;
  }

  return `€${high}`;
}

export default function ItemDetailScreen() {
  const router =
    useRouter();

  const { id } =
    useLocalSearchParams<{
      id?:
        | string
        | string[];
    }>();

  const {
    clothes,
    loading,
    removeClothingItem,
    markClothingWorn,
    unmarkClothingWorn,
  } = useWardrobe();

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const [
    changingWear,
    setChangingWear,
  ] = useState(false);

  const itemId =
    Array.isArray(id)
      ? id[0]
      : id;

  const item =
    clothes.find(
      (clothingItem) =>
        clothingItem.id ===
        itemId
    );

  function goBackSafe() {
    if (
      router.canGoBack()
    ) {
      router.back();
    } else {
      router.replace("/");
    }
  }

  async function handleWearToggle() {
    if (!item) {
      return;
    }

    try {
      setChangingWear(true);

      if (
        isToday(
          item.lastWornAt
        )
      ) {
        await unmarkClothingWorn(
          item.id
        );
      } else {
        await markClothingWorn(
          item.id
        );
      }
    } catch (error) {
      console.error(
        "Wear tracking failed:",
        error
      );

      Alert.alert(
        "Error",
        "Could not update wear status."
      );
    } finally {
      setChangingWear(false);
    }
  }

  function handleDelete() {
    if (!item) {
      return;
    }

    Alert.alert(
      "Delete item",
      `Are you sure you want to delete "${item.name}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Delete",
          style: "destructive",

          onPress:
            async () => {
              try {
                setDeleting(true);

                await removeClothingItem(
                  item.id
                );

                goBackSafe();
              } catch (error) {
                console.error(
                  "Delete failed:",
                  error
                );

                Alert.alert(
                  "Error",
                  "Could not delete this item."
                );
              } finally {
                setDeleting(false);
              }
            },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Loading item...
        </Text>
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.center}>
        <Text
          style={
            styles.notFoundTitle
          }
        >
          Item not found
        </Text>

        <Pressable
          style={
            styles.backButtonLarge
          }
          onPress={
            goBackSafe
          }
        >
          <Text
            style={
              styles.backButtonLargeText
            }
          >
            Go back
          </Text>
        </Pressable>
      </View>
    );
  }

  const wornToday =
    isToday(
      item.lastWornAt
    );

  const estimatedValue =
    formatEstimatedValue(
      item.estimatedValueLowEUR,
      item.estimatedValueHighEUR
    );

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable
            style={
              styles.headerButton
            }
            onPress={
              goBackSafe
            }
          >
            <Text
              style={
                styles.headerButtonText
              }
            >
              ←
            </Text>
          </Pressable>

          <Text
            style={
              styles.headerTitle
            }
          >
            Item
          </Text>

          <View
            style={
              styles.headerSpacer
            }
          />
        </View>

        {/* IMAGE */}
        <View
          style={
            styles.imageCard
          }
        >
          <Image
            source={{
              uri:
                item.image,
            }}
            style={
              styles.image
            }
            resizeMode="contain"
          />
        </View>

        {/* MAIN INFO */}
        <View
          style={
            styles.mainInfo
          }
        >
          <Text
            style={
              styles.itemName
            }
          >
            {item.name}
          </Text>

          <Text
            style={
              styles.itemCategory
            }
          >
            {item.category}
          </Text>
        </View>

        {/* WEAR TRACKING */}
        <View
          style={
            styles.wearCard
          }
        >
          <View
            style={
              styles.wearStats
            }
          >
            <View
              style={
                styles.wearStat
              }
            >
              <Text
                style={
                  styles.wearNumber
                }
              >
                {item.wearCount ??
                  0}
              </Text>

              <Text
                style={
                  styles.wearLabel
                }
              >
                Times worn
              </Text>
            </View>

            <View
              style={
                styles.wearDivider
              }
            />

            <View
              style={
                styles.wearStat
              }
            >
              <Text
                style={
                  styles.lastWornText
                }
              >
                {formatLastWorn(
                  item.lastWornAt
                )}
              </Text>

              <Text
                style={
                  styles.wearLabel
                }
              >
                Last worn
              </Text>
            </View>
          </View>

          <Pressable
            style={[
              styles.wearButton,

              wornToday &&
                styles.undoWearButton,

              changingWear &&
                styles.disabledButton,
            ]}
            disabled={
              changingWear
            }
            onPress={
              handleWearToggle
            }
          >
            {changingWear ? (
              <ActivityIndicator
                color={
                  wornToday
                    ? "#111111"
                    : "#FFFFFF"
                }
              />
            ) : (
              <Text
                style={[
                  styles.wearButtonText,

                  wornToday &&
                    styles.undoWearButtonText,
                ]}
              >
                {wornToday
                  ? "Undo worn today"
                  : "Wear today"}
              </Text>
            )}
          </Pressable>
        </View>

        {/* DETAILS */}
        <View
          style={
            styles.detailsCard
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            Details
          </Text>

          <DetailRow
            label="Category"
            value={
              item.category
            }
          />

          <DetailRow
            label="Subcategory"
            value={
              item.subcategory
            }
          />

          <DetailRow
            label="Brand"
            value={
              item.brand
            }
          />

          <DetailRow
            label="Estimated value"
            value={
              estimatedValue
            }
          />

          <DetailRow
            label="Color"
            value={
              item.color
            }
          />

          <DetailRow
            label="Secondary color"
            value={
              item.secondaryColor
            }
          />

          <DetailRow
            label="Season"
            value={
              item.season
            }
          />

          <DetailRow
            label="Occasion"
            value={
              item.occasion
            }
          />

          <DetailRow
            label="Material"
            value={
              item.material
            }
          />

          <DetailRow
            label="Fit"
            value={
              item.fit
            }
          />

          <DetailRow
            label="Pattern"
            value={
              item.pattern
            }
          />

          <DetailRow
            label="Tags"
            value={
              item.tags
            }
          />
        </View>

        {/* EDIT */}
        <Pressable
          style={
            styles.editButton
          }
          onPress={() =>
            router.push({
              pathname:
                "/edit-item/[id]",

              params: {
                id:
                  item.id,
              },
            })
          }
        >
          <Text
            style={
              styles.editButtonText
            }
          >
            Edit item
          </Text>
        </Pressable>

        {/* DELETE */}
        <Pressable
          style={[
            styles.deleteButton,

            deleting &&
              styles.disabledButton,
          ]}
          disabled={
            deleting
          }
          onPress={
            handleDelete
          }
        >
          {deleting ? (
            <ActivityIndicator />
          ) : (
            <Text
              style={
                styles.deleteButtonText
              }
            >
              Delete item
            </Text>
          )}
        </Pressable>
      </ScrollView>
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

    scrollContent: {
      width: "100%",
      maxWidth: 700,

      alignSelf:
        "center",

      paddingHorizontal: 20,
      paddingBottom: 50,
    },

    header: {
      width: "100%",

      paddingTop: 18,
      paddingBottom: 18,

      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    headerButton: {
      width: 44,
      height: 44,

      borderRadius: 22,

      backgroundColor:
        "#F3F3F3",

      alignItems: "center",
      justifyContent:
        "center",
    },

    headerButtonText: {
      fontSize: 25,
      fontWeight: "500",
    },

    headerTitle: {
      fontSize: 18,
      fontWeight: "700",
    },

    headerSpacer: {
      width: 44,
    },

    imageCard: {
      width: "100%",
      aspectRatio: 4 / 5,

      backgroundColor:
        "#F5F5F5",

      borderRadius: 22,

      overflow: "hidden",

      alignItems: "center",
      justifyContent:
        "center",
    },

    image: {
      width: "100%",
      height: "100%",
    },

    mainInfo: {
      marginTop: 22,
      marginBottom: 8,
    },

    itemName: {
      fontSize: 28,
      fontWeight: "800",

      color: "#111111",
    },

    itemCategory: {
      marginTop: 6,

      fontSize: 16,

      color: "#777777",
    },

    wearCard: {
      marginTop: 22,

      padding: 18,

      backgroundColor:
        "#F8F8F8",

      borderRadius: 18,
    },

    wearStats: {
      flexDirection: "row",
      alignItems: "center",
    },

    wearStat: {
      flex: 1,
      alignItems: "center",
    },

    wearDivider: {
      width: 1,
      height: 46,

      backgroundColor:
        "#DDDDDD",
    },

    wearNumber: {
      fontSize: 25,
      fontWeight: "800",

      color: "#111111",
    },

    lastWornText: {
      fontSize: 15,
      fontWeight: "700",

      color: "#111111",

      textAlign: "center",
    },

    wearLabel: {
      marginTop: 4,

      fontSize: 13,

      color: "#777777",
    },

    wearButton: {
      marginTop: 18,

      minHeight: 52,

      borderRadius: 14,

      backgroundColor:
        "#111111",

      borderWidth: 1,
      borderColor:
        "#111111",

      alignItems: "center",
      justifyContent:
        "center",
    },

    wearButtonText: {
      color: "#FFFFFF",

      fontSize: 16,
      fontWeight: "700",
    },

    undoWearButton: {
      backgroundColor:
        "#FFFFFF",

      borderColor:
        "#D0D0D0",
    },

    undoWearButtonText: {
      color: "#111111",
    },

    detailsCard: {
      marginTop: 22,

      backgroundColor:
        "#F8F8F8",

      borderRadius: 18,

      paddingHorizontal: 18,
      paddingTop: 20,
      paddingBottom: 4,
    },

    sectionTitle: {
      fontSize: 20,
      fontWeight: "800",

      color: "#111111",

      marginBottom: 8,
    },

    detailRow: {
      minHeight: 52,

      paddingVertical: 14,

      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent:
        "space-between",

      borderBottomWidth: 1,
      borderBottomColor:
        "#E5E5E5",

      gap: 20,
    },

    detailLabel: {
      fontSize: 15,
      fontWeight: "600",

      color: "#555555",

      flexShrink: 0,
    },

    detailValue: {
      flex: 1,

      fontSize: 15,
      fontWeight: "500",

      color: "#111111",

      textAlign: "right",

      lineHeight: 21,
    },

    editButton: {
      marginTop: 30,

      minHeight: 54,

      borderRadius: 14,

      backgroundColor:
        "#111111",

      alignItems: "center",
      justifyContent:
        "center",

      paddingHorizontal: 20,
    },

    editButtonText: {
      color: "#FFFFFF",

      fontSize: 16,
      fontWeight: "700",
    },

    deleteButton: {
      marginTop: 12,

      minHeight: 54,

      borderRadius: 14,

      backgroundColor:
        "#FFE8E8",

      alignItems: "center",
      justifyContent:
        "center",

      paddingHorizontal: 20,
    },

    deleteButtonText: {
      color: "#C62828",

      fontSize: 16,
      fontWeight: "700",
    },

    disabledButton: {
      opacity: 0.5,
    },

    center: {
      flex: 1,

      padding: 24,

      alignItems: "center",
      justifyContent:
        "center",

      backgroundColor:
        "#FFFFFF",
    },

    loadingText: {
      marginTop: 12,

      fontSize: 15,

      color: "#666666",
    },

    notFoundTitle: {
      fontSize: 22,
      fontWeight: "700",

      marginBottom: 20,
    },

    backButtonLarge: {
      minHeight: 48,

      paddingHorizontal: 24,

      borderRadius: 14,

      backgroundColor:
        "#111111",

      alignItems: "center",
      justifyContent:
        "center",
    },

    backButtonLargeText: {
      color: "#FFFFFF",

      fontSize: 15,
      fontWeight: "700",
    },
  });