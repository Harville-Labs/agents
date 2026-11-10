export type Item = string | { term: string; path?: string; text?: string };

export type Block = { label?: string } & (
  | { p: string }
  | { ol: Item[] }
  | { ul: Item[] }
  | { table: string[][] }
);

export type Entry = {
  title: [label: string, path?: string][];
  mono?: boolean;
  one?: string;
  body?: Block[];
  say?: string;
  keys?: string;
};

export type GuideSection = { id: string; title: string; sub?: string; entries: Entry[] };
