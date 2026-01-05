
export const childrenTypes = [
  "child_1",
  "child_2",
  "child_3",
  "child_4",
  "child_5",
  "child_6",
  "child_7",
  "child_8",
  "child_9",
  "child_10",
] as const;
export type TChildrenTypes = (typeof childrenTypes)[number];
export type ChildrenTypesWithCore = TChildrenTypes | "core";
