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

import * as ImagePicker from "expo-image-picker";

import { useRouter } from "expo-router";

import { supabase } from "../lib/supabase";
import { uploadClothingImage } from "../lib/uploadClothingImage";
import { useWardrobe } from "../context/WardrobeContext";

type ScanResult = {
  name: string;
  category: string;

  subcategory: string[];
  brand: string[];

  color: string[];
  secondaryColor: string[];

  season: string[];
  occasion: string[];

  material: string[];
  fit: string[];

  pattern: string[];
  tags: string[];

  estimatedValueLowEUR: number | null;
  estimatedValueHighEUR: number | null;
};

function cleanStringArray(
  value: unknown
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string =>
      typeof item === "string"
  );
}

function cleanValue(
  value: unknown
): number | null {
  const number = Number(value);

  if (
    !Number.isFinite(number) ||
    number < 0
  ) {
    return null;
  }

  return Math.round(number);
}

function formatValue(
  low: number | null,
  high: number | null
) {
  if (
    low === null &&
    high === null
  ) {
    return "Estimate unavailable";
  }

  if (
    low !== null &&
    high !== null
  ) {
    if (low === high) {
      return `€${low}`;
    }

    return `€${low} – €${high}`;
  }

  if (low !== null) {
    return `From €${low}`;
  }

  return `Up to €${high}`;
}

export default function ScanValueScreen() {
  const router = useRouter();

  const {
    addClothingItem,
  } = useWardrobe();

  const [
    imagePreview,
    setImagePreview,
  ] = useState<string | null>(
    null
  );

  const [
    imageBase64,
    setImageBase64,
  ] = useState<string | null>(
    null
  );

  const [
    imageMimeType,
    setImageMimeType,
  ] = useState(
    "image/jpeg"
  );

  const [
    result,
    setResult,
  ] = useState<ScanResult | null>(
    null
  );

  const [
    analyzing,
    setAnalyzing,
  ] = useState(false);

  const [
    adding,
    setAdding,
  ] = useState(false);

  function goBackSafe() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  }

  function resetScan() {
    setImagePreview(null);
    setImageBase64(null);
    setImageMimeType(
      "image/jpeg"
    );
    setResult(null);
  }

  async function analyzeClothing(
    base64: string,
    mimeType: string
  ) {
    try {
      setAnalyzing(true);
      setResult(null);

      const {
        data,
        error,
      } =
        await supabase.functions.invoke(
          "analyze-clothing",
          {
            body: {
              imageBase64:
                base64,

              mimeType,
            },
          }
        );

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error(
          "No analysis returned"
        );
      }

      console.log(
        "Scan value result:",
        data
      );

      const low =
        cleanValue(
          data.estimatedValueLowEUR
        );

      const high =
        cleanValue(
          data.estimatedValueHighEUR
        );

      let finalLow = low;
      let finalHigh = high;

      if (
        finalLow !== null &&
        finalHigh !== null &&
        finalHigh < finalLow
      ) {
        const temp =
          finalLow;

        finalLow =
          finalHigh;

        finalHigh =
          temp;
      }

      setResult({
        name:
          typeof data.name ===
          "string"
            ? data.name.trim()
            : "Clothing item",

        category:
          typeof data.category ===
          "string"
            ? data.category
            : "Tops",

        subcategory:
          cleanStringArray(
            data.subcategory
          ),

        brand:
          cleanStringArray(
            data.brand
          ),

        color:
          cleanStringArray(
            data.color
          ),

        secondaryColor:
          cleanStringArray(
            data.secondaryColor
          ),

        season:
          cleanStringArray(
            data.season
          ),

        occasion:
          cleanStringArray(
            data.occasion
          ),

        material:
          cleanStringArray(
            data.material
          ),

        fit:
          cleanStringArray(
            data.fit
          ),

        pattern:
          cleanStringArray(
            data.pattern
          ),

        tags:
          cleanStringArray(
            data.tags
          ),

        estimatedValueLowEUR:
          finalLow,

        estimatedValueHighEUR:
          finalHigh,
      });
    } catch (error) {
      console.error(
        "Scan value failed:",
        error
      );

      Alert.alert(
        "Scan failed",
        "Could not analyze this item. Try another photo."
      );
    } finally {
      setAnalyzing(false);
    }
  }

  async function useSelectedImage(
    asset: ImagePicker.ImagePickerAsset
  ) {
    setImagePreview(
      asset.uri
    );

    if (!asset.base64) {
      Alert.alert(
        "Image error",
        "Could not read this image."
      );

      return;
    }

    const mimeType =
      asset.mimeType ||
      "image/jpeg";

    setImageBase64(
      asset.base64
    );

    setImageMimeType(
      mimeType
    );

    await analyzeClothing(
      asset.base64,
      mimeType
    );
  }

  async function takePhoto() {
    const permission =
      await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Camera permission is required."
      );

      return;
    }

    const response =
      await ImagePicker.launchCameraAsync(
        {
          mediaTypes:
            ImagePicker
              .MediaTypeOptions
              .Images,

          allowsEditing: true,

          aspect: [
            4,
            5,
          ],

          quality: 0.7,

          base64: true,
        }
      );

    if (
      !response.canceled &&
      response.assets?.[0]
    ) {
      await useSelectedImage(
        response.assets[0]
      );
    }
  }

  async function chooseFromGallery() {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Gallery permission is required."
      );

      return;
    }

    const response =
      await ImagePicker.launchImageLibraryAsync(
        {
          mediaTypes:
            ImagePicker
              .MediaTypeOptions
              .Images,

          allowsEditing: true,

          aspect: [
            4,
            5,
          ],

          quality: 0.7,

          base64: true,
        }
      );

    if (
      !response.canceled &&
      response.assets?.[0]
    ) {
      await useSelectedImage(
        response.assets[0]
      );
    }
  }

  async function handleAddToWardrobe() {
    if (
      !result ||
      !imageBase64
    ) {
      return;
    }

    try {
      setAdding(true);

      const imageUrl =
        await uploadClothingImage(
          imageBase64,
          imageMimeType
        );

      await addClothingItem({
        id: "",

        name:
          result.name,

        category:
          result.category,

        image:
          imageUrl,

        subcategory:
          result.subcategory,

        brand:
          result.brand,

        color:
          result.color,

        secondaryColor:
          result.secondaryColor,

        season:
          result.season,

        occasion:
          result.occasion,

        material:
          result.material,

        fit:
          result.fit,

        pattern:
          result.pattern,

        tags:
          result.tags,

        wearCount:
          0,

        lastWornAt:
          null,

        estimatedValueLowEUR:
          result.estimatedValueLowEUR,

        estimatedValueHighEUR:
          result.estimatedValueHighEUR,
      });

      Alert.alert(
        "Added",
        "Item added to your wardrobe.",
        [
          {
            text: "OK",

            onPress: () =>
              router.replace(
                "/"
              ),
          },
        ]
      );
    } catch (error) {
      console.error(
        "Failed to add scanned item:",
        error
      );

      Alert.alert(
        "Error",
        "Could not add this item to your wardrobe."
      );
    } finally {
      setAdding(false);
    }
  }

  const brand =
    result?.brand?.length
      ? result.brand.join(", ")
      : "Unknown brand";

  const subcategory =
    result?.subcategory?.length
      ? result.subcategory.join(
          ", "
        )
      : result?.category ||
        "";

  return (
    <View
      style={
        styles.screen
      }
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <View
          style={
            styles.header
          }
        >
          <Pressable
            style={
              styles.backButton
            }
            onPress={
              goBackSafe
            }
          >
            <Text
              style={
                styles.backText
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
            Scan value
          </Text>

          <View
            style={
              styles.headerSpacer
            }
          />
        </View>

        <Text
          style={
            styles.introTitle
          }
        >
          Thrift scanner
        </Text>

        <Text
          style={
            styles.introText
          }
        >
          Take a photo and get an estimated resale value before you buy.
        </Text>

        <View
          style={
            styles.imageCard
          }
        >
          {imagePreview ? (
            <Image
              source={{
                uri:
                  imagePreview,
              }}
              style={
                styles.image
              }
              resizeMode="contain"
            />
          ) : (
            <View
              style={
                styles.emptyImage
              }
            >
              <Text
                style={
                  styles.cameraIcon
                }
              >
                ◉
              </Text>

              <Text
                style={
                  styles.emptyTitle
                }
              >
                Scan a clothing item
              </Text>

              <Text
                style={
                  styles.emptySubtitle
                }
              >
                Logos and labels should be visible when possible.
              </Text>
            </View>
          )}

          {analyzing && (
            <View
              style={
                styles.analysisOverlay
              }
            >
              <ActivityIndicator
                size="large"
              />

              <Text
                style={
                  styles.analysisTitle
                }
              >
                Scanning item...
              </Text>

              <Text
                style={
                  styles.analysisSubtitle
                }
              >
                Identifying brand and estimating resale value
              </Text>
            </View>
          )}
        </View>

        {!result && (
          <View
            style={
              styles.photoButtons
            }
          >
            <Pressable
              style={
                styles.primaryButton
              }
              disabled={
                analyzing
              }
              onPress={
                takePhoto
              }
            >
              <Text
                style={
                  styles.primaryButtonText
                }
              >
                Take photo
              </Text>
            </Pressable>

            <Pressable
              style={
                styles.secondaryButton
              }
              disabled={
                analyzing
              }
              onPress={
                chooseFromGallery
              }
            >
              <Text
                style={
                  styles.secondaryButtonText
                }
              >
                Gallery
              </Text>
            </Pressable>
          </View>
        )}

        {result && (
          <>
            <View
              style={
                styles.resultCard
              }
            >
              <Text
                style={
                  styles.resultLabel
                }
              >
                ESTIMATED RESALE VALUE
              </Text>

              <Text
                style={
                  styles.valueText
                }
              >
                {formatValue(
                  result.estimatedValueLowEUR,
                  result.estimatedValueHighEUR
                )}
              </Text>

              <Text
                style={
                  styles.valueNote
                }
              >
                AI estimate — not a confirmed sale price
              </Text>
            </View>

            <View
              style={
                styles.infoCard
              }
            >
              <View
                style={
                  styles.infoRow
                }
              >
                <Text
                  style={
                    styles.infoLabel
                  }
                >
                  Brand
                </Text>

                <Text
                  style={
                    styles.infoValue
                  }
                >
                  {brand}
                </Text>
              </View>

              <View
                style={
                  styles.infoRow
                }
              >
                <Text
                  style={
                    styles.infoLabel
                  }
                >
                  Item
                </Text>

                <Text
                  style={
                    styles.infoValue
                  }
                >
                  {result.name}
                </Text>
              </View>

              <View
                style={
                  styles.infoRow
                }
              >
                <Text
                  style={
                    styles.infoLabel
                  }
                >
                  Type
                </Text>

                <Text
                  style={
                    styles.infoValue
                  }
                >
                  {subcategory}
                </Text>
              </View>

              {result.color.length >
                0 && (
                <View
                  style={
                    styles.infoRow
                  }
                >
                  <Text
                    style={
                      styles.infoLabel
                    }
                  >
                    Color
                  </Text>

                  <Text
                    style={
                      styles.infoValue
                    }
                  >
                    {result.color.join(
                      ", "
                    )}
                  </Text>
                </View>
              )}

              {result.material.length >
                0 && (
                <View
                  style={
                    styles.infoRowLast
                  }
                >
                  <Text
                    style={
                      styles.infoLabel
                    }
                  >
                    Material
                  </Text>

                  <Text
                    style={
                      styles.infoValue
                    }
                  >
                    {result.material.join(
                      ", "
                    )}
                  </Text>
                </View>
              )}
            </View>

            <View
              style={
                styles.ebayCard
              }
            >
              <View
                style={
                  styles.ebayHeader
                }
              >
                <Text
                  style={
                    styles.ebayTitle
                  }
                >
                  eBay market data
                </Text>

                <View
                  style={
                    styles.soonBadge
                  }
                >
                  <Text
                    style={
                      styles.soonText
                    }
                  >
                    NEXT
                  </Text>
                </View>
              </View>

              <Text
                style={
                  styles.ebayPlaceholder
                }
              >
                Similar eBay listings and typical asking price will appear here once the eBay API is connected.
              </Text>
            </View>

            <Pressable
              style={[
                styles.addButton,

                adding &&
                  styles.disabledButton,
              ]}
              disabled={
                adding
              }
              onPress={
                handleAddToWardrobe
              }
            >
              {adding ? (
                <ActivityIndicator
                  color="#FFFFFF"
                />
              ) : (
                <Text
                  style={
                    styles.addButtonText
                  }
                >
                  Add to wardrobe
                </Text>
              )}
            </Pressable>

            <Pressable
              style={
                styles.scanAgainButton
              }
              disabled={
                adding
              }
              onPress={
                resetScan
              }
            >
              <Text
                style={
                  styles.scanAgainText
                }
              >
                Scan another item
              </Text>
            </Pressable>
          </>
        )}
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

    content: {
      width: "100%",
      maxWidth: 700,

      alignSelf:
        "center",

      paddingHorizontal: 20,
      paddingBottom: 60,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",

      paddingTop: 18,
      paddingBottom: 18,
    },

    backButton: {
      width: 44,
      height: 44,

      borderRadius: 22,

      alignItems: "center",
      justifyContent:
        "center",

      backgroundColor:
        "#F2F2F2",
    },

    backText: {
      fontSize: 25,

      fontWeight: "500",
    },

    headerTitle: {
      fontSize: 18,

      fontWeight: "800",
    },

    headerSpacer: {
      width: 44,
    },

    introTitle: {
      marginTop: 8,

      fontSize: 31,

      fontWeight: "900",

      color: "#111111",
    },

    introText: {
      marginTop: 8,
      marginBottom: 22,

      maxWidth: 500,

      fontSize: 15,

      lineHeight: 22,

      color: "#666666",
    },

    imageCard: {
      width: "100%",

      aspectRatio: 4 / 5,

      borderRadius: 22,

      overflow: "hidden",

      backgroundColor:
        "#F4F4F4",

      alignItems: "center",
      justifyContent:
        "center",
    },

    image: {
      width: "100%",
      height: "100%",
    },

    emptyImage: {
      alignItems: "center",
      justifyContent:
        "center",

      paddingHorizontal: 35,
    },

    cameraIcon: {
      fontSize: 45,

      color: "#888888",
    },

    emptyTitle: {
      marginTop: 15,

      fontSize: 18,

      fontWeight: "800",

      color: "#111111",
    },

    emptySubtitle: {
      marginTop: 7,

      fontSize: 13,

      lineHeight: 19,

      textAlign: "center",

      color: "#777777",
    },

    analysisOverlay: {
      ...StyleSheet.absoluteFillObject,

      backgroundColor:
        "rgba(255,255,255,0.90)",

      alignItems: "center",
      justifyContent:
        "center",

      paddingHorizontal: 30,
    },

    analysisTitle: {
      marginTop: 14,

      fontSize: 18,

      fontWeight: "800",

      color: "#111111",
    },

    analysisSubtitle: {
      marginTop: 7,

      fontSize: 13,

      textAlign: "center",

      color: "#666666",
    },

    photoButtons: {
      marginTop: 16,

      flexDirection: "row",

      gap: 12,
    },

    primaryButton: {
      flex: 1,

      minHeight: 54,

      borderRadius: 15,

      backgroundColor:
        "#111111",

      alignItems: "center",
      justifyContent:
        "center",
    },

    primaryButtonText: {
      color: "#FFFFFF",

      fontSize: 16,

      fontWeight: "800",
    },

    secondaryButton: {
      flex: 1,

      minHeight: 54,

      borderRadius: 15,

      borderWidth: 1,

      borderColor:
        "#D6D6D6",

      backgroundColor:
        "#FFFFFF",

      alignItems: "center",
      justifyContent:
        "center",
    },

    secondaryButtonText: {
      color: "#111111",

      fontSize: 16,

      fontWeight: "700",
    },

    resultCard: {
      marginTop: 22,

      paddingHorizontal: 20,
      paddingVertical: 25,

      borderRadius: 20,

      backgroundColor:
        "#111111",
    },

    resultLabel: {
      fontSize: 11,

      fontWeight: "800",

      letterSpacing: 1.2,

      color: "#AAAAAA",
    },

    valueText: {
      marginTop: 9,

      fontSize: 37,

      fontWeight: "900",

      color: "#FFFFFF",
    },

    valueNote: {
      marginTop: 8,

      fontSize: 12,

      color: "#AAAAAA",
    },

    infoCard: {
      marginTop: 14,

      paddingHorizontal: 18,

      borderRadius: 18,

      backgroundColor:
        "#F7F7F7",
    },

    infoRow: {
      minHeight: 55,

      flexDirection: "row",
      alignItems:
        "flex-start",
      justifyContent:
        "space-between",

      gap: 20,

      paddingVertical: 16,

      borderBottomWidth: 1,

      borderBottomColor:
        "#E4E4E4",
    },

    infoRowLast: {
      minHeight: 55,

      flexDirection: "row",
      alignItems:
        "flex-start",
      justifyContent:
        "space-between",

      gap: 20,

      paddingVertical: 16,
    },

    infoLabel: {
      fontSize: 14,

      fontWeight: "600",

      color: "#666666",
    },

    infoValue: {
      flex: 1,

      fontSize: 15,

      fontWeight: "700",

      textAlign: "right",

      color: "#111111",
    },

    ebayCard: {
      marginTop: 14,

      padding: 18,

      borderWidth: 1,

      borderColor:
        "#E1E1E1",

      borderRadius: 18,

      backgroundColor:
        "#FFFFFF",
    },

    ebayHeader: {
      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",
    },

    ebayTitle: {
      fontSize: 16,

      fontWeight: "800",

      color: "#111111",
    },

    soonBadge: {
      paddingHorizontal: 9,

      paddingVertical: 5,

      borderRadius: 999,

      backgroundColor:
        "#EEEEEE",
    },

    soonText: {
      fontSize: 10,

      fontWeight: "800",

      color: "#666666",
    },

    ebayPlaceholder: {
      marginTop: 10,

      fontSize: 13,

      lineHeight: 19,

      color: "#777777",
    },

    addButton: {
      marginTop: 22,

      minHeight: 56,

      borderRadius: 16,

      alignItems: "center",
      justifyContent:
        "center",

      backgroundColor:
        "#111111",
    },

    addButtonText: {
      color: "#FFFFFF",

      fontSize: 16,

      fontWeight: "800",
    },

    scanAgainButton: {
      marginTop: 10,

      minHeight: 54,

      borderRadius: 16,

      alignItems: "center",
      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        "#D6D6D6",
    },

    scanAgainText: {
      fontSize: 15,

      fontWeight: "700",

      color: "#111111",
    },

    disabledButton: {
      opacity: 0.5,
    },
  });