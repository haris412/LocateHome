/**
 * Property type = top level (Homes, Plots, Commercial).
 * Subtype = specific option under that property type (House, Flat, Office, …).
 */

export type PropertyCategoryId = 'homes' | 'plots' | 'commercial';

export interface PropertySubtypeOption {
  /** Stable id for URL/query state (kebab-case). */
  id: string;
  label: string;
}

export interface PropertyCategoryGroup {
  id: PropertyCategoryId;
  label: string;
  count: number;
  subtypes: PropertySubtypeOption[];
}

export const PROPERTY_CATEGORY_GROUPS: readonly PropertyCategoryGroup[] = [
  {
    id: 'homes',
    label: 'Homes',
    count: 9,
    subtypes: [
      { id: 'house', label: 'House' },
      { id: 'flat', label: 'Flat' },
      { id: 'apartment', label: 'Apartment' },
      { id: 'villa', label: 'Villa' },
      { id: 'upper-portion', label: 'Upper Portion' },
      { id: 'lower-portion', label: 'Lower Portion' },
      { id: 'farm-house', label: 'Farm House' },
      { id: 'room', label: 'Room' },
      { id: 'penthouse', label: 'Penthouse' }
    ]
  },
  {
    id: 'plots',
    label: 'Plots',
    count: 6,
    subtypes: [
      { id: 'residential-plot', label: 'Residential Plot' },
      { id: 'commercial-plot', label: 'Commercial Plot' },
      { id: 'agricultural-land', label: 'Agricultural Land' },
      { id: 'industrial-land', label: 'Industrial Land' },
      { id: 'plot-file', label: 'Plot File' },
      { id: 'plot-form', label: 'Plot Form' }
    ]
  },
  {
    id: 'commercial',
    label: 'Commercial',
    count: 6,
    subtypes: [
      { id: 'office', label: 'Office' },
      { id: 'shop', label: 'Shop' },
      { id: 'warehouse', label: 'Warehouse' },
      { id: 'factory', label: 'Factory' },
      { id: 'building', label: 'Building' },
      { id: 'other', label: 'Other' }
    ]
  }
];

const ALL_SUBTYPE_IDS = new Map<string, PropertyCategoryId>();
for (const group of PROPERTY_CATEGORY_GROUPS) {
  for (const st of group.subtypes) {
    ALL_SUBTYPE_IDS.set(st.id, group.id);
  }
}

/** Value sent as `subType` query / API param (lowercase label, backend-friendly). */
export function subtypeIdToApiValue(subtypeId: string): string {
  for (const group of PROPERTY_CATEGORY_GROUPS) {
    const found = group.subtypes.find((s) => s.id === subtypeId);
    if (found) return found.label.toLowerCase();
  }
  return subtypeId.replace(/-/g, ' ');
}

export function categoryForSubtypeId(subtypeId: string | null | undefined): PropertyCategoryId | null {
  if (!subtypeId || subtypeId === 'any') return null;
  return ALL_SUBTYPE_IDS.get(subtypeId) ?? null;
}

export function isKnownSubtypeId(id: string): boolean {
  return ALL_SUBTYPE_IDS.has(id);
}

export function subtypeOptionsForCategory(
  categoryId: string | null | undefined
): readonly PropertySubtypeOption[] {
  if (!categoryId || categoryId === 'any') return [];
  const group = PROPERTY_CATEGORY_GROUPS.find((g) => g.id === categoryId);
  return group?.subtypes ?? [];
}

/** Select options: Any + subtypes for category, or all subtypes when category is any. */
export function subtypeFilterOptions(categoryId: string | null | undefined): { id: string; label: string }[] {
  const anyOpt = { id: 'any', label: 'Any' };
  if (!categoryId || categoryId === 'any') {
    const merged: { id: string; label: string }[] = [];
    for (const group of PROPERTY_CATEGORY_GROUPS) {
      for (const st of group.subtypes) {
        merged.push({ id: st.id, label: st.label });
      }
    }
    return [anyOpt, ...merged];
  }
  return [anyOpt, ...subtypeOptionsForCategory(categoryId).map((s) => ({ id: s.id, label: s.label }))];
}

/** Top-level property type options (Homes, Plots, Commercial) + Any. */
export const PROPERTY_CATEGORY_SELECT_OPTIONS: { id: string; label: string }[] = [
  { id: 'any', label: 'Any' },
  ...PROPERTY_CATEGORY_GROUPS.map((g) => ({ id: g.id, label: g.label }))
];

/** Alias: same as {@link PROPERTY_CATEGORY_SELECT_OPTIONS}. */
export const PROPERTY_TYPE_SELECT_OPTIONS = PROPERTY_CATEGORY_SELECT_OPTIONS;

/** Map API / legacy `propertyType` string back to subtype id when possible. */
export function apiValueToSubtypeId(apiValue: string): string | null {
  const normalized = apiValue.trim().toLowerCase();
  for (const group of PROPERTY_CATEGORY_GROUPS) {
    for (const st of group.subtypes) {
      if (st.label.toLowerCase() === normalized || st.id === normalized) {
        return st.id;
      }
    }
  }
  return null;
}
