import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import type { ClothingItem } from "../types/clothing";
import { supabase } from "../lib/supabase";

type WardrobeContextType = {
  clothes: ClothingItem[];
  loading: boolean;

  addClothingItem: (
    item: ClothingItem
  ) => Promise<void>;

  updateClothingItem: (
    item: ClothingItem
  ) => Promise<void>;

  removeClothingItem: (
    id: string
  ) => Promise<void>;

  markClothingWorn: (
    id: string
  ) => Promise<void>;

  unmarkClothingWorn: (
    id: string
  ) => Promise<void>;

  refreshWardrobe: () => Promise<void>;
};

const WardrobeContext =
  createContext<
    WardrobeContextType | undefined
  >(undefined);

type Props = {
  children: ReactNode;
};

type DatabaseClothingItem = {
  id: number;

  name: string;
  category: string;
  image_url: string;

  subcategory: string[] | null;
  brand: string[] | null;

  color: string[] | null;
  secondary_color: string[] | null;

  season: string[] | null;
  occasion: string[] | null;

  material: string[] | null;
  fit: string[] | null;

  pattern: string[] | null;
  tags: string[] | null;

  wear_count: number | null;
  last_worn_at: string | null;

  estimated_value_low_eur:
    | number
    | null;

  estimated_value_high_eur:
    | number
    | null;
};

const clothingSelect = `
  id,
  name,
  category,
  image_url,
  subcategory,
  brand,
  color,
  secondary_color,
  season,
  occasion,
  material,
  fit,
  pattern,
  tags,
  wear_count,
  last_worn_at,
  estimated_value_low_eur,
  estimated_value_high_eur
`;

function formatClothingItem(
  item: DatabaseClothingItem
): ClothingItem {
  return {
    id: String(item.id),

    name: item.name,
    category: item.category,
    image: item.image_url,

    subcategory:
      item.subcategory ?? [],

    brand:
      item.brand ?? [],

    color:
      item.color ?? [],

    secondaryColor:
      item.secondary_color ?? [],

    season:
      item.season ?? [],

    occasion:
      item.occasion ?? [],

    material:
      item.material ?? [],

    fit:
      item.fit ?? [],

    pattern:
      item.pattern ?? [],

    tags:
      item.tags ?? [],

    wearCount:
      item.wear_count ?? 0,

    lastWornAt:
      item.last_worn_at ?? null,

    estimatedValueLowEUR:
      item.estimated_value_low_eur ??
      null,

    estimatedValueHighEUR:
      item.estimated_value_high_eur ??
      null,
  };
}

function getLocalDateString() {
  const now =
    new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      now.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function WardrobeProvider({
  children,
}: Props) {
  const [
    clothes,
    setClothes,
  ] = useState<
    ClothingItem[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  useEffect(() => {
    loadWardrobe();

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (
            session?.user
          ) {
            loadWardrobe();
          } else {
            setClothes(
              []
            );

            setLoading(
              false
            );
          }
        }
      );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadWardrobe() {
    try {
      setLoading(
        true
      );

      const {
        data: {
          user,
        },
        error:
          userError,
      } =
        await supabase.auth.getUser();

      if (
        userError
      ) {
        throw userError;
      }

      if (!user) {
        setClothes(
          []
        );

        return;
      }

      const {
        data,
        error,
      } =
        await supabase
          .from(
            "clothes_items"
          )
          .select(
            clothingSelect
          )
          .order(
            "created_at",
            {
              ascending:
                false,
            }
          );

      if (error) {
        throw error;
      }

      const formatted =
        (
          data ?? []
        ).map(
          (
            item
          ) =>
            formatClothingItem(
              item as DatabaseClothingItem
            )
        );

      setClothes(
        formatted
      );
    } catch (
      error
    ) {
      console.error(
        "Failed to load wardrobe:",
        error
      );
    } finally {
      setLoading(
        false
      );
    }
  }

  async function addClothingItem(
    item: ClothingItem
  ) {
    const {
      data: {
        user,
      },
      error:
        userError,
    } =
      await supabase.auth.getUser();

    if (
      userError
    ) {
      throw userError;
    }

    if (!user) {
      throw new Error(
        "You must be signed in."
      );
    }

    const {
      data,
      error,
    } =
      await supabase
        .from(
          "clothes_items"
        )
        .insert({
          user_id:
            user.id,

          name:
            item.name,

          category:
            item.category,

          image_url:
            item.image,

          subcategory:
            item.subcategory,

          brand:
            item.brand,

          color:
            item.color,

          secondary_color:
            item.secondaryColor,

          season:
            item.season,

          occasion:
            item.occasion,

          material:
            item.material,

          fit:
            item.fit,

          pattern:
            item.pattern,

          tags:
            item.tags,

          estimated_value_low_eur:
            item.estimatedValueLowEUR ??
            null,

          estimated_value_high_eur:
            item.estimatedValueHighEUR ??
            null,
        })
        .select(
          clothingSelect
        )
        .single();

    if (error) {
      console.error(
        "Failed to add clothing item:",
        error
      );

      throw error;
    }

    const newItem =
      formatClothingItem(
        data as DatabaseClothingItem
      );

    setClothes(
      (
        current
      ) => [
        newItem,
        ...current,
      ]
    );
  }

  async function updateClothingItem(
    item: ClothingItem
  ) {
    const {
      data: {
        user,
      },
      error:
        userError,
    } =
      await supabase.auth.getUser();

    if (
      userError
    ) {
      throw userError;
    }

    if (!user) {
      throw new Error(
        "You must be signed in."
      );
    }

    const {
      data,
      error,
    } =
      await supabase
        .from(
          "clothes_items"
        )
        .update({
          name:
            item.name,

          category:
            item.category,

          image_url:
            item.image,

          subcategory:
            item.subcategory,

          brand:
            item.brand,

          color:
            item.color,

          secondary_color:
            item.secondaryColor,

          season:
            item.season,

          occasion:
            item.occasion,

          material:
            item.material,

          fit:
            item.fit,

          pattern:
            item.pattern,

          tags:
            item.tags,

          estimated_value_low_eur:
            item.estimatedValueLowEUR ??
            null,

          estimated_value_high_eur:
            item.estimatedValueHighEUR ??
            null,
        })
        .eq(
          "id",
          Number(
            item.id
          )
        )
        .eq(
          "user_id",
          user.id
        )
        .select(
          clothingSelect
        )
        .single();

    if (error) {
      console.error(
        "Failed to update clothing item:",
        error
      );

      throw error;
    }

    const updatedItem =
      formatClothingItem(
        data as DatabaseClothingItem
      );

    setClothes(
      (
        current
      ) =>
        current.map(
          (
            currentItem
          ) =>
            currentItem.id ===
            updatedItem.id
              ? updatedItem
              : currentItem
        )
    );
  }

  async function removeClothingItem(
    id: string
  ) {
    const {
      data: {
        user,
      },
      error:
        userError,
    } =
      await supabase.auth.getUser();

    if (
      userError
    ) {
      throw userError;
    }

    if (!user) {
      throw new Error(
        "You must be signed in."
      );
    }

    const {
      error,
    } =
      await supabase
        .from(
          "clothes_items"
        )
        .delete()
        .eq(
          "id",
          Number(
            id
          )
        )
        .eq(
          "user_id",
          user.id
        );

    if (error) {
      console.error(
        "Failed to delete clothing item:",
        error
      );

      throw error;
    }

    setClothes(
      (
        current
      ) =>
        current.filter(
          (
            item
          ) =>
            item.id !==
            id
        )
    );
  }

  async function markClothingWorn(
    id: string
  ) {
    const {
      data: {
        user,
      },
      error:
        userError,
    } =
      await supabase.auth.getUser();

    if (
      userError
    ) {
      throw userError;
    }

    if (!user) {
      throw new Error(
        "You must be signed in."
      );
    }

    const wornOn =
      getLocalDateString();

    const {
      error,
    } =
      await supabase.rpc(
        "mark_clothing_worn",
        {
          p_item_id:
            Number(
              id
            ),

          p_worn_on:
            wornOn,
        }
      );

    if (error) {
      console.error(
        "Failed to mark item as worn:",
        error
      );

      throw error;
    }

    await loadWardrobe();
  }

  async function unmarkClothingWorn(
    id: string
  ) {
    const {
      data: {
        user,
      },
      error:
        userError,
    } =
      await supabase.auth.getUser();

    if (
      userError
    ) {
      throw userError;
    }

    if (!user) {
      throw new Error(
        "You must be signed in."
      );
    }

    const wornOn =
      getLocalDateString();

    const {
      error,
    } =
      await supabase.rpc(
        "unmark_clothing_worn",
        {
          p_item_id:
            Number(
              id
            ),

          p_worn_on:
            wornOn,
        }
      );

    if (error) {
      console.error(
        "Failed to undo worn today:",
        error
      );

      throw error;
    }

    await loadWardrobe();
  }

  async function refreshWardrobe() {
    await loadWardrobe();
  }

  return (
    <WardrobeContext.Provider
      value={{
        clothes,
        loading,

        addClothingItem,
        updateClothingItem,
        removeClothingItem,

        markClothingWorn,
        unmarkClothingWorn,

        refreshWardrobe,
      }}
    >
      {children}
    </WardrobeContext.Provider>
  );
}

export function useWardrobe() {
  const context =
    useContext(
      WardrobeContext
    );

  if (!context) {
    throw new Error(
      "useWardrobe must be used inside WardrobeProvider"
    );
  }

  return context;
}