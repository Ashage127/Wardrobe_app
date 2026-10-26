import {
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

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

import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import { useWardrobe } from "../../context/WardrobeContext";
import { uploadClothingImage } from "../../lib/uploadClothingImage";
import { supabase } from "../../lib/supabase";

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

function toggleArrayValue(
  value: string,
  current: string[],
  setter: Dispatch<
    SetStateAction<string[]>
  >
) {
  setter((existing) =>
    existing.includes(value)
      ? existing.filter(
          (item) =>
            item !== value
        )
      : [...existing, value]
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
    .map((item) =>
      item.trim()
    )
    .filter(Boolean);
}

export default function EditItemScreen() {
  const router = useRouter();

  const { id } =
    useLocalSearchParams<{
      id?: string | string[];
    }>();

  const {
    clothes,
    loading,
    updateClothingItem,
  } = useWardrobe();

  const itemId = Array.isArray(id)
    ? id[0]
    : id;

  const item = clothes.find(
    (clothingItem) =>
      clothingItem.id === itemId
  );

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
    imagePreview,
    setImagePreview,
  ] = useState("");

  const [
    newImageBase64,
    setNewImageBase64,
  ] = useState<string | null>(
    null
  );

  const [
    newImageMimeType,
    setNewImageMimeType,
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

  useEffect(() => {
    if (!item) {
      return;
    }

    setName(item.name);

    setCategory(
      item.category || "Tops"
    );

    setSelectedSubcategories(
      item.subcategory ?? []
    );

    setBrandInput(
      (item.brand ?? []).join(
        ", "
      )
    );

    setSelectedColors(
      item.color ?? []
    );

    setSelectedSecondaryColors(
      item.secondaryColor ?? []
    );

    setSelectedSeasons(
      item.season ?? []
    );

    setSelectedOccasions(
      item.occasion ?? []
    );

    setSelectedMaterials(
      item.material ?? []
    );

    setSelectedFits(
      item.fit ?? []
    );

    setSelectedPatterns(
      item.pattern ?? []
    );

    setTagsInput(
      (item.tags ?? []).join(
        ", "
      )
    );

    setImagePreview(
      item.image
    );
  }, [item]);

  function changeCategory(
    nextCategory: string
  ) {
    setCategory(nextCategory);

    setSelectedSubcategories(
      (current) =>
        current.filter(
          (value) =>
            (
              subcategories[
                nextCategory
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
          : category;

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
        setBrandInput(
          data.brand
            .filter(
              (
                value: unknown
              ) =>
                typeof value ===
                "string"
            )
            .join(", ")
        );
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
        setTagsInput(
          data.tags
            .filter(
              (
                value: unknown
              ) =>
                typeof value ===
                "string"
            )
            .join(", ")
        );
      }
    } catch (error) {
      console.error(
        "AI analysis failed:",
        error
      );

      Alert.alert(
        "AI analysis failed",
        "The photo was selected, but AI analysis could not be completed."
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

    setNewImageBase64(
      asset.base64
    );

    setNewImageMimeType(
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

    if (
      !permission.granted
    ) {
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
          aspect: [4, 5],
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

    if (
      !permission.granted
    ) {
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
          aspect: [4, 5],
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
    if (!item) {
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

      let finalImage =
        item.image;

      if (
        newImageBase64
      ) {
        finalImage =
          await uploadClothingImage(
            newImageBase64,
            newImageMimeType
          );
      }

      await updateClothingItem({
        ...item,

        name:
          name.trim(),

        category,

        image:
          finalImage,

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
      });

      router.back();
    } catch (error) {
      console.error(
        "Failed to save item:",
        error
      );

      Alert.alert(
        "Error",
        "Could not save changes."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View
        style={
          styles.center
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
          Loading item...
        </Text>
      </View>
    );
  }

  if (!item) {
    return (
      <View
        style={
          styles.center
        }
      >
        <Text
          style={
            styles.notFoundTitle
          }
        >
          Item not found
        </Text>

        <Pressable
          style={
            styles.darkButton
          }
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={
              styles.darkButtonText
            }
          >
            Go back
          </Text>
        </Pressable>
      </View>
    );
  }

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
            onPress={() =>
              router.back()
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
            Edit item
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
          {!!imagePreview && (
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
                  styles.analysisText
                }
              >
                Analyzing clothing...
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
              styles.photoButton
            }
            onPress={
              takePhoto
            }
            disabled={
              analyzing
            }
          >
            <Text
              style={
                styles.photoButtonText
              }
            >
              Camera
            </Text>
          </Pressable>

          <Pressable
            style={
              styles.photoButton
            }
            onPress={
              chooseFromGallery
            }
            disabled={
              analyzing
            }
          >
            <Text
              style={
                styles.photoButtonText
              }
            >
              Gallery
            </Text>
          </Pressable>
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
            toggleArrayValue(
              value,
              selectedSubcategories,
              setSelectedSubcategories
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
            Brand
          </Text>

          <TextInput
            value={
              brandInput
            }
            onChangeText={
              setBrandInput
            }
            placeholder="Nike, Adidas..."
            style={
              styles.input
            }
          />
        </View>

        <ChipSection
          title="Main color"
          options={colors}
          selected={
            selectedColors
          }
          onToggle={(
            value
          ) =>
            toggleArrayValue(
              value,
              selectedColors,
              setSelectedColors
            )
          }
        />

        <ChipSection
          title="Secondary color"
          options={colors}
          selected={
            selectedSecondaryColors
          }
          onToggle={(
            value
          ) =>
            toggleArrayValue(
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
            toggleArrayValue(
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
            toggleArrayValue(
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
            toggleArrayValue(
              value,
              selectedMaterials,
              setSelectedMaterials
            )
          }
        />

        <ChipSection
          title="Fit"
          options={fits}
          selected={
            selectedFits
          }
          onToggle={(
            value
          ) =>
            toggleArrayValue(
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
            toggleArrayValue(
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
            placeholder="streetwear, casual, basic"
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
              Save changes
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
      justifyContent: "center",
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
      backgroundColor:
        "#F5F5F5",
      borderRadius: 22,
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
    },

    image: {
      width: "100%",
      height: "100%",
    },

    analysisOverlay: {
      ...StyleSheet.absoluteFillObject,

      backgroundColor:
        "rgba(255,255,255,0.82)",

      alignItems: "center",
      justifyContent: "center",
    },

    analysisText: {
      marginTop: 12,
      fontSize: 15,
      fontWeight: "600",
      color: "#111111",
    },

    imageButtons: {
      flexDirection: "row",
      gap: 12,
      marginTop: 14,
      marginBottom: 28,
    },

    photoButton: {
      flex: 1,
      minHeight: 50,
      borderRadius: 14,
      borderWidth: 1,
      borderColor:
        "#D8D8D8",
      alignItems: "center",
      justifyContent: "center",
    },

    photoButtonText: {
      fontSize: 15,
      fontWeight: "700",
      color: "#111111",
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

    saveButton: {
      minHeight: 56,
      marginTop: 8,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "#111111",
    },

    saveButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "800",
    },

    disabledButton: {
      opacity: 0.5,
    },

    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      backgroundColor:
        "#FFFFFF",
    },

    loadingText: {
      marginTop: 12,
      color: "#666666",
    },

    notFoundTitle: {
      fontSize: 22,
      fontWeight: "800",
      marginBottom: 20,
    },

    darkButton: {
      minHeight: 50,
      paddingHorizontal: 24,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "#111111",
    },

    darkButtonText: {
      color: "#FFFFFF",
      fontWeight: "700",
    },
  });