
export type SuggestionOutput =
  | { location: string; values: readonly unknown[] }
  | SuggestionGroup;

export interface SuggestionGroup {
  meta: readonly string[];
  group: readonly SuggestionOutput[];
}

function isGroup(o: SuggestionOutput): o is SuggestionGroup {
  return (o as SuggestionGroup).meta !== undefined;
}

export function decodeSuggestionOutput(
  json: unknown
): readonly SuggestionOutput[] {
  // TODO decoding
  return json as SuggestionOutput[];
}

export interface ValueWithMeta {
  value: unknown;
  locations: readonly string[];
  meta: readonly string[];
}

function addMeta(
  meta: readonly string[],
  o: SuggestionOutput
): readonly ValueWithMeta[] {
  if (isGroup(o)) {
    const { meta, group } = o;
    return group.flatMap((v) => addMeta(meta, v));
  } else {
    const { location, values } = o;
    const locations = [location];
    return values.map((value) => ({ value, locations, meta }));
  }
}

export function toValueWithMeta(
  suggestions: readonly SuggestionOutput[]
): readonly ValueWithMeta[] {
  const withMeta: ValueWithMeta[] = suggestions.flatMap((o) => addMeta([], o));
  const grouped = groupBy(withMeta, ({ value }) => value);
  const merge = (acc: ValueWithMeta, v: ValueWithMeta) => ({
    value: v.value,
    locations: [...acc.locations, ...v.locations],
    meta: [...acc.meta, ...v.meta],
  });
  const merged = [...grouped
    .values()]
    .map((vs) => vs.reduce(merge, { value: {}, locations: [], meta: [] }))
  return merged;
}

function groupBy<K, V>(
  vs: readonly V[],
  by: (v: V) => K
): ReadonlyMap<K, readonly V[]> {
  const result = new Map<K, V[]>();
  vs.forEach((v) => {
    const k = by(v);
    const group = result.get(k);
    if (group) {
      result.set(k, [...group, v]);
    } else {
      result.set(k, [v]);
    }
  });
  return result;
}
