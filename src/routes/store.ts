import { writable } from "svelte/store";

export type Tool = "ADD" | "REMOVE" | "EXTRUDE" | "PAINT"
export let tool = writable<Tool>("ADD");