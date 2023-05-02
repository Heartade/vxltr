import { writable } from "svelte/store";

export type Tool = "ADD" | "REMOVE" | "EXTRUDE" | "PAINT";
export let tool = writable<Tool>("ADD");
export type Mode = "POINT" | "FACE"
export let mode = writable<Mode>("POINT");
export let drag = writable<boolean>(false);
export let dragInit = writable<boolean>(false);
export let showTarget = writable<boolean>(true);
export let hasRedo = writable<boolean>(false);
export let hasUndo = writable<boolean>(false);
export const COLORS = [0, 1, 2, 3]
  .map((r) =>
    [0, 1, 2, 3].map((g) =>
      [0, 1, 2, 3].map((b) => `rgb(${[r, g, b].map(x=>Math.round(x*255/3)).join(",")})`)
    )
  )
  .flat(2);
export let startTimeStamp = writable<number>(0);
export let endTimeStamp = writable<number>(0);
export let addCount = writable<number>(0);
export let removeCount = writable<number>(0);
export let undoCount = writable<number>(0);
export let redoCount = writable<number>(0);
export let touchCount = writable<number>(0);
export let dragCount = writable<number>(0);
export let colorId = writable<number>(11);