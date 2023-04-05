import { writable } from "svelte/store";

export type Tool = "ADD" | "REMOVE" | "EXTRUDE" | "PAINT";
export let tool = writable<Tool>("ADD");
export type Mode = "POINT" | "FACE"
export let mode = writable<Mode>("POINT");

export const COLORS = [0, 1, 2, 3]
  .map((r) =>
    [0, 1, 2, 3].map((g) =>
      [0, 1, 2, 3].map((b) => `rgb(${[r, g, b].map(x=>Math.round(x*255/3)).join(",")})`)
    )
  )
  .flat(2);

export let colorId = writable<number>(11);