import { useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import * as ImagePicker from "expo-image-picker";

import { useRouter } from "expo-router";

import { useWardrobe } from "../context/WardrobeContext";
import { uploadClothingImage } from "../lib/uploadClothingImage";
import { supabase } from "../lib/supabase";

const categories = [
  "Tops",
  "Bottoms",
  "Shoes",
  "Outerwear",
  "Accessories",
];

const subcategories: Record<string, string[]> = {
  Tops: [
    "T-Shirt",
    "Long Sleeve",
    "Shirt",
    "Hoodie",
    "Sweater",
    "Sweatshirt",
    "Tank Top",
    "Polo",
    "Blouse",
    "Cardigan",
  ],

  Bottoms: [
    "Jeans",
    "Trousers",
    "Cargo Pants",
    "Sweatpants",
    "Shorts",
    "Skirt",
    "Leggings",
    "Chinos",
  ],

  Shoes: [
    "Sneakers",
    "Boots",
    "Loafers",
    "Sandals",
    "Heels",
    "Formal Shoes",
    "Slides",
    "Running Shoes",
  ],

  Outerwear: [
    "Jacket",
    "Coat",
    "Puffer",
    "Blazer",
    "Vest",
    "Rain Jacket",
    "Bomber",
    "Denim Jacket",
  ],

  Accessories: [
    "Hat",
    "Cap",
    "Belt",
    "Bag",
    "Backpack",
    "Scarf",
    "Watch",
    "Jewellery",
    "Sunglasses",
    "Tie",
  ],
};

const colors = [
  "Black",
  "White",
  "Grey",
  "Beige",
  "Brown",
  "Navy",
  "Blue",
  "Light Blue",
  "Green",
  "Olive",
  "Red",
  "Burgundy",
  "Pink",
  "Purple",
  "Orange",
  "Yellow",
  "Cream",
  "Silver",
  "Gold",
];

const seasons = [
  "Spring",
  "Summer",
  "Autumn",
  "Winter",
  "All Season",
];

const occasions = [
  "Casual",
  "School",
  "Work",
  "Formal",
  "Party",
  "Sport",
  "Outdoor",
  "Home",
  "Going Out",
];

const materials = [
  "Cotton",
  "Polyester",
  "Wool",
  "Denim",
  "Leather",
  "Suede",
  "Linen",
  "Nylon",
  "Fleece",
  "Silk",
  "Cashmere",
  "Viscose",
  "Elastane",
];

const fits = [
  "Slim",
  "Regular",
  "Relaxed",
  "Oversized",
  "Loose",
  "Baggy",
  "Cropped",
  "Fitted",
];

const patterns = [
  "Solid",
  "Striped",
  "Checked",
  "Plaid",
  "Graphic",
  "Logo",
  "Floral",
  "Camo",
  "Polka Dot",
  "Animal Print",
];

type ChipSectionProps = {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
};

function ChipSection({
  title,
  options,
  selected,
  onToggle,
}: ChipSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {title}
      </Text>

      <View style={styles.chips}>
        {options.map((option) => {
          const active =
            selected.includes(option);

          return (
            <Pressable
              key={option}
              style={[
                styles.chip,
                active &&
                  styles.chipActive,
              ]}
              onPress={() =>
                onToggle(option)
              }
            >
              <Text
                style={[
                  styles.chipText,
                  active &&
                    styles.chipTextActive,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function toggleValue(
  value: string,
  selected: string[],
  setter: React.Dispatch<
    React.SetStateAction<string[]>
  >
) {
  setter((current) =>
    current.includes(value)
      ? current.filter(
          (item) => item !== value
        )
      : [...current, value]
  );
}

function keepAllowedValues(
  value: unknown,
  allowed: string[]
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string =>
      typeof item === "string" &&
      allowed.includes(item)
  );
}

function parseCommaList(
  value: string
): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseOptionalNumber(
  value: string
): number | null {
  if (!value.trim()) {
    return null;
  }

  const number =
    Number(value.replace(",", "."));

  if (!Number.isFinite(number)) {
    return null;
  }

  return Math.max(
    0,
    Math.round(number)
  );
}

export default function AddItemScreen() {
  const router = useRouter();

  const {
    addClothingItem,
  } = useWardrobe();

  const [name, setName] =
    useState("");

  const [category, setCategory] =
    useState("Tops");

  const [
    selectedSubcategories,
    setSelectedSubcategories,
  ] = useState<string[]>([]);

  const [
    brandInput,
    setBrandInput,
  ] = useState("");

  const [
    selectedColors,
    setSelectedColors,
  ] = useState<string[]>([]);

  const [
    selectedSecondaryColors,
    setSelectedSecondaryColors,
  ] = useState<string[]>([]);

  const [
    selectedSeasons,
    setSelectedSeasons,
  ] = useState<string[]>([]);

  const [
    selectedOccasions,
    setSelectedOccasions,
  ] = useState<string[]>([]);

  const [
    selectedMaterials,
    setSelectedMaterials,
  ] = useState<string[]>([]);

  const [
    selectedFits,
    setSelectedFits,
  ] = useState<string[]>([]);

  const [
    selectedPatterns,
    setSelectedPatterns,
  ] = useState<string[]>([]);

  const [
    tagsInput,
    setTagsInput,
  ] = useState("");

  const [
    estimatedValueLowInput,
    setEstimatedValueLowInput,
  ] = useState("");

  const [
    estimatedValueHighInput,
    setEstimatedValueHighInput,
  ] = useState("");

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
    saving,
    setSaving,
  ] = useState(false);

  const [
    analyzing,
    setAnalyzing,
  ] = useState(false);

  function goBackSafe() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  }

  function changeCategory(
    newCategory: string
  ) {
    setCategory(
      newCategory
    );

    setSelectedSubcategories(
      (current) =>
        current.filter(
          (value) =>
            (
              subcategories[
                newCategory
              ] ?? []
            ).includes(value)
        )
    );
  }

  async function analyzeClothing(
    base64: string,
    mimeType: string
  ) {
    try {
      setAnalyzing(true);

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
          "No AI analysis returned"
        );
      }

      console.log(
        "AI clothing analysis:",
        data
      );

      if (
        typeof data.name ===
          "string" &&
        data.name.trim()
      ) {
        setName(
          data.name.trim()
        );
      }

      const nextCategory =
        categories.includes(
          data.category
        )
          ? data.category
          : "Tops";

      setCategory(
        nextCategory
      );

      setSelectedSubcategories(
        keepAllowedValues(
          data.subcategory,
          subcategories[
            nextCategory
          ] ?? []
        )
      );

      if (
        Array.isArray(
          data.brand
        )
      ) {
        const brands =
          data.brand.filter(
            (
              value: unknown
            ): value is string =>
              typeof value ===
              "string"
          );

        setBrandInput(
          brands.join(", ")
        );
      } else {
        setBrandInput("");
      }

      setSelectedColors(
        keepAllowedValues(
          data.color,
          colors
        )
      );

      setSelectedSecondaryColors(
        keepAllowedValues(
          data.secondaryColor,
          colors
        )
      );

      setSelectedSeasons(
        keepAllowedValues(
          data.season,
          seasons
        )
      );

      setSelectedOccasions(
        keepAllowedValues(
          data.occasion,
          occasions
        )
      );

      setSelectedMaterials(
        keepAllowedValues(
          data.material,
          materials
        )
      );

      setSelectedFits(
        keepAllowedValues(
          data.fit,
          fits
        )
      );

      setSelectedPatterns(
        keepAllowedValues(
          data.pattern,
          patterns
        )
      );

      if (
        Array.isArray(
          data.tags
        )
      ) {
        const tags =
          data.tags.filter(
            (
              value: unknown
            ): value is string =>
              typeof value ===
              "string"
          );

        setTagsInput(
          tags.join(", ")
        );
      } else {
        setTagsInput("");
      }

      if (
        typeof data
          .estimatedValueLowEUR ===
          "number" &&
        Number.isFinite(
          data
            .estimatedValueLowEUR
        )
      ) {
        setEstimatedValueLowInput(
          String(
            Math.max(
              0,
              Math.round(
                data
                  .estimatedValueLowEUR
              )
            )
          )
        );
      } else {
        setEstimatedValueLowInput(
          ""
        );
      }

      if (
        typeof data
          .estimatedValueHighEUR ===
          "number" &&
        Number.isFinite(
          data
            .estimatedValueHighEUR
        )
      ) {
        setEstimatedValueHighInput(
          String(
            Math.max(
              0,
              Math.round(
                data
                  .estimatedValueHighEUR
              )
            )
          )
        );
      } else {
        setEstimatedValueHighInput(
          ""
        );
      }
    } catch (error) {
      console.error(
        "AI analysis failed:",
        error
      );

      Alert.alert(
        "AI analysis failed",
        "The photo was selected, but AI analysis could not be completed. You can still enter the details manually."
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
        "Could not read the selected image."
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

    const result =
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
      !result.canceled &&
      result.assets?.[0]
    ) {
      await useSelectedImage(
        result.assets[0]
      );
    }
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

    const result =
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
      !result.canceled &&
      result.assets?.[0]
    ) {
      await useSelectedImage(
        result.assets[0]
      );
    }
  }

  async function handleSave() {
    if (!imageBase64) {
      Alert.alert(
        "Missing photo",
        "Please add a photo first."
      );

      return;
    }

    if (!name.trim()) {
      Alert.alert(
        "Missing name",
        "Please enter an item name."
      );

      return;
    }

    try {
      setSaving(true);

      const imageUrl =
        await uploadClothingImage(
          imageBase64,
          imageMimeType
        );

      let estimatedValueLowEUR =
        parseOptionalNumber(
          estimatedValueLowInput
        );

      let estimatedValueHighEUR =
        parseOptionalNumber(
          estimatedValueHighInput
        );

      if (
        estimatedValueLowEUR !==
          null &&
        estimatedValueHighEUR !==
          null &&
        estimatedValueHighEUR <
          estimatedValueLowEUR
      ) {
        const temporary =
          estimatedValueLowEUR;

        estimatedValueLowEUR =
          estimatedValueHighEUR;

        estimatedValueHighEUR =
          temporary;
      }

      await addClothingItem({
        id: "",

        name:
          name.trim(),

        category,

        image:
          imageUrl,

        subcategory:
          selectedSubcategories,

        brand:
          parseCommaList(
            brandInput
          ),

        color:
          selectedColors,

        secondaryColor:
          selectedSecondaryColors,

        season:
          selectedSeasons,

        occasion:
          selectedOccasions,

        material:
          selectedMaterials,

        fit:
          selectedFits,

        pattern:
          selectedPatterns,

        tags:
          parseCommaList(
            tagsInput
          ),

        wearCount:
          0,

        lastWornAt:
          null,

        estimatedValueLowEUR,

        estimatedValueHighEUR,
      });

      router.replace("/");
    } catch (error) {
      console.error(
        "Failed to save clothing item:",
        error
      );

      Alert.alert(
        "Error",
        "Could not save this item."
      );
    } finally {
      setSaving(false);
    }
  }

  const hasEstimatedValue =
    estimatedValueLowInput.trim() ||
    estimatedValueHighInput.trim();

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <View style={styles.header}>
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
            Add item
          </Text>

          <View
            style={
              styles.headerSpacer
            }
          />
        </View>

        <View
          style={
            styles.imageBox
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
                  styles.emptyImageIcon
                }
              >
                +
              </Text>

              <Text
                style={
                  styles.emptyImageText
                }
              >
                Add clothing photo
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
                Analyzing clothing...
              </Text>

              <Text
                style={
                  styles.analysisSubtitle
                }
              >
                Detecting brand, style and estimated value
              </Text>
            </View>
          )}
        </View>

        <View
          style={
            styles.imageButtons
          }
        >
          <Pressable
            style={
              styles.imageButton
            }
            disabled={
              analyzing ||
              saving
            }
            onPress={
              takePhoto
            }
          >
            <Text
              style={
                styles.imageButtonText
              }
            >
              Camera
            </Text>
          </Pressable>

          <Pressable
            style={
              styles.imageButton
            }
            disabled={
              analyzing ||
              saving
            }
            onPress={
              chooseFromGallery
            }
          >
            <Text
              style={
                styles.imageButtonText
              }
            >
              Gallery
            </Text>
          </Pressable>
        </View>

        {imagePreview &&
          !analyzing && (
            <View
              style={
                styles.aiCompleteCard
              }
            >
              <Text
                style={
                  styles.aiCompleteText
                }
              >
                AI analysis complete
              </Text>

              <Text
                style={
                  styles.aiCompleteSubtext
                }
              >
                Check the details below and correct anything if needed.
              </Text>
            </View>
          )}

        <View
          style={
            styles.section
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            Name
          </Text>

          <TextInput
            value={name}
            onChangeText={
              setName
            }
            placeholder="Item name"
            style={
              styles.input
            }
          />
        </View>

        <View
          style={
            styles.section
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            Brand
          </Text>

          <TextInput
            value={
              brandInput
            }
            onChangeText={
              setBrandInput
            }
            placeholder="Nike, Adidas, Levi's..."
            style={
              styles.input
            }
          />
        </View>

        <View
          style={
            styles.valueCard
          }
        >
          <View
            style={
              styles.valueHeader
            }
          >
            <View>
              <Text
                style={
                  styles.valueTitle
                }
              >
                Estimated value
              </Text>

              <Text
                style={
                  styles.valueSubtitle
                }
              >
                AI resale estimate
              </Text>
            </View>

            {hasEstimatedValue ? (
              <Text
                style={
                  styles.valueBig
                }
              >
                €
                {estimatedValueLowInput ||
                  "0"}
                {" – €"}
                {estimatedValueHighInput ||
                  estimatedValueLowInput ||
                  "0"}
              </Text>
            ) : (
              <Text
                style={
                  styles.valueUnknown
                }
              >
                —
              </Text>
            )}
          </View>

          <View
            style={
              styles.valueInputs
            }
          >
            <View
              style={
                styles.valueInputContainer
              }
            >
              <Text
                style={
                  styles.valueInputLabel
                }
              >
                From €
              </Text>

              <TextInput
                value={
                  estimatedValueLowInput
                }
                onChangeText={
                  setEstimatedValueLowInput
                }
                placeholder="20"
                keyboardType="numeric"
                style={
                  styles.valueInput
                }
              />
            </View>

            <View
              style={
                styles.valueInputContainer
              }
            >
              <Text
                style={
                  styles.valueInputLabel
                }
              >
                To €
              </Text>

              <TextInput
                value={
                  estimatedValueHighInput
                }
                onChangeText={
                  setEstimatedValueHighInput
                }
                placeholder="40"
                keyboardType="numeric"
                style={
                  styles.valueInput
                }
              />
            </View>
          </View>

          <Text
            style={
              styles.valueDisclaimer
            }
          >
            Estimate only. It is not a live marketplace price or authenticity check.
          </Text>
        </View>

        <View
          style={
            styles.section
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            Category
          </Text>

          <View
            style={
              styles.chips
            }
          >
            {categories.map(
              (option) => {
                const active =
                  category ===
                  option;

                return (
                  <Pressable
                    key={
                      option
                    }
                    style={[
                      styles.chip,

                      active &&
                        styles.chipActive,
                    ]}
                    onPress={() =>
                      changeCategory(
                        option
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.chipText,

                        active &&
                          styles.chipTextActive,
                      ]}
                    >
                      {option}
                    </Text>
                  </Pressable>
                );
              }
            )}
          </View>
        </View>

        <ChipSection
          title="Subcategory"
          options={
            subcategories[
              category
            ] ?? []
          }
          selected={
            selectedSubcategories
          }
          onToggle={(
            value
          ) =>
            toggleValue(
              value,
              selectedSubcategories,
              setSelectedSubcategories
            )
          }
        />

        <ChipSection
          title="Main color"
          options={
            colors
          }
          selected={
            selectedColors
          }
          onToggle={(
            value
          ) =>
            toggleValue(
              value,
              selectedColors,
              setSelectedColors
            )
          }
        />

        <ChipSection
          title="Secondary color"
          options={
            colors
          }
          selected={
            selectedSecondaryColors
          }
          onToggle={(
            value
          ) =>
            toggleValue(
              value,
              selectedSecondaryColors,
              setSelectedSecondaryColors
            )
          }
        />

        <ChipSection
          title="Season"
          options={
            seasons
          }
          selected={
            selectedSeasons
          }
          onToggle={(
            value
          ) =>
            toggleValue(
              value,
              selectedSeasons,
              setSelectedSeasons
            )
          }
        />

        <ChipSection
          title="Occasion"
          options={
            occasions
          }
          selected={
            selectedOccasions
          }
          onToggle={(
            value
          ) =>
            toggleValue(
              value,
              selectedOccasions,
              setSelectedOccasions
            )
          }
        />

        <ChipSection
          title="Material"
          options={
            materials
          }
          selected={
            selectedMaterials
          }
          onToggle={(
            value
          ) =>
            toggleValue(
              value,
              selectedMaterials,
              setSelectedMaterials
            )
          }
        />

        <ChipSection
          title="Fit"
          options={
            fits
          }
          selected={
            selectedFits
          }
          onToggle={(
            value
          ) =>
            toggleValue(
              value,
              selectedFits,
              setSelectedFits
            )
          }
        />

        <ChipSection
          title="Pattern"
          options={
            patterns
          }
          selected={
            selectedPatterns
          }
          onToggle={(
            value
          ) =>
            toggleValue(
              value,
              selectedPatterns,
              setSelectedPatterns
            )
          }
        />

        <View
          style={
            styles.section
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            Tags
          </Text>

          <TextInput
            value={
              tagsInput
            }
            onChangeText={
              setTagsInput
            }
            placeholder="streetwear, casual, vintage..."
            style={
              styles.input
            }
          />

          <Text
            style={
              styles.hint
            }
          >
            Separate tags with commas.
          </Text>
        </View>

        <Pressable
          style={[
            styles.saveButton,

            (saving ||
              analyzing) &&
              styles.disabledButton,
          ]}
          disabled={
            saving ||
            analyzing
          }
          onPress={
            handleSave
          }
        >
          {saving ? (
            <ActivityIndicator
              color="#FFFFFF"
            />
          ) : (
            <Text
              style={
                styles.saveButtonText
              }
            >
              Add to wardrobe
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

    content: {
      width: "100%",
      maxWidth: 720,

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
      fontSize: 20,
      fontWeight: "800",
    },

    headerSpacer: {
      width: 44,
    },

    imageBox: {
      width: "100%",
      aspectRatio: 4 / 5,

      borderRadius: 22,

      overflow: "hidden",

      backgroundColor:
        "#F5F5F5",

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
    },

    emptyImageIcon: {
      fontSize: 54,
      fontWeight: "300",
      color: "#999999",
    },

    emptyImageText: {
      marginTop: 5,

      fontSize: 15,
      fontWeight: "600",

      color: "#777777",
    },

    analysisOverlay: {
      ...StyleSheet.absoluteFillObject,

      backgroundColor:
        "rgba(255,255,255,0.88)",

      alignItems: "center",
      justifyContent:
        "center",

      paddingHorizontal: 30,
    },

    analysisTitle: {
      marginTop: 14,

      fontSize: 17,
      fontWeight: "800",

      color: "#111111",
    },

    analysisSubtitle: {
      marginTop: 7,

      fontSize: 13,

      color: "#666666",

      textAlign: "center",
    },

    imageButtons: {
      flexDirection: "row",
      gap: 12,

      marginTop: 14,
      marginBottom: 20,
    },

    imageButton: {
      flex: 1,

      minHeight: 50,

      borderRadius: 14,

      borderWidth: 1,
      borderColor:
        "#D8D8D8",

      alignItems: "center",
      justifyContent:
        "center",
    },

    imageButtonText: {
      fontSize: 15,
      fontWeight: "700",

      color: "#111111",
    },

    aiCompleteCard: {
      marginBottom: 24,

      paddingHorizontal: 16,
      paddingVertical: 14,

      borderRadius: 14,

      backgroundColor:
        "#F4F4F4",
    },

    aiCompleteText: {
      fontSize: 15,
      fontWeight: "800",

      color: "#111111",
    },

    aiCompleteSubtext: {
      marginTop: 4,

      fontSize: 13,

      color: "#666666",
    },

    section: {
      marginBottom: 26,
    },

    sectionTitle: {
      fontSize: 17,
      fontWeight: "800",

      color: "#111111",

      marginBottom: 12,
    },

    input: {
      width: "100%",

      minHeight: 52,

      borderWidth: 1,
      borderColor:
        "#DADADA",

      borderRadius: 14,

      paddingHorizontal: 15,

      fontSize: 16,

      backgroundColor:
        "#FFFFFF",
    },

    hint: {
      marginTop: 7,

      fontSize: 13,

      color: "#777777",
    },

    chips: {
      flexDirection: "row",
      flexWrap: "wrap",

      gap: 9,
    },

    chip: {
      paddingHorizontal: 14,
      paddingVertical: 10,

      borderRadius: 999,

      borderWidth: 1,
      borderColor:
        "#DADADA",

      backgroundColor:
        "#FFFFFF",
    },

    chipActive: {
      backgroundColor:
        "#111111",

      borderColor:
        "#111111",
    },

    chipText: {
      fontSize: 14,
      fontWeight: "600",

      color: "#333333",
    },

    chipTextActive: {
      color: "#FFFFFF",
    },

    valueCard: {
      marginBottom: 28,

      padding: 18,

      borderRadius: 18,

      backgroundColor:
        "#F7F7F7",
    },

    valueHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",

      gap: 12,
    },

    valueTitle: {
      fontSize: 17,
      fontWeight: "800",

      color: "#111111",
    },

    valueSubtitle: {
      marginTop: 4,

      fontSize: 13,

      color: "#777777",
    },

    valueBig: {
      fontSize: 21,
      fontWeight: "800",

      color: "#111111",

      textAlign: "right",
    },

    valueUnknown: {
      fontSize: 24,

      color: "#999999",
    },

    valueInputs: {
      flexDirection: "row",

      gap: 12,

      marginTop: 18,
    },

    valueInputContainer: {
      flex: 1,
    },

    valueInputLabel: {
      marginBottom: 7,

      fontSize: 13,
      fontWeight: "700",

      color: "#555555",
    },

    valueInput: {
      minHeight: 48,

      borderWidth: 1,
      borderColor:
        "#DADADA",

      borderRadius: 12,

      paddingHorizontal: 14,

      fontSize: 16,

      backgroundColor:
        "#FFFFFF",
    },

    valueDisclaimer: {
      marginTop: 12,

      fontSize: 12,
      lineHeight: 17,

      color: "#888888",
    },

    saveButton: {
      minHeight: 56,

      marginTop: 6,

      borderRadius: 16,

      backgroundColor:
        "#111111",

      alignItems: "center",
      justifyContent:
        "center",
    },

    saveButtonText: {
      color: "#FFFFFF",

      fontSize: 16,
      fontWeight: "800",
    },

    disabledButton: {
      opacity: 0.5,
    },
  });