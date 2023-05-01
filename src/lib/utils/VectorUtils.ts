import * as BABYLON from 'babylonjs';

export const clip = (min: number, max: number, x: number) => {
  return Math.min(Math.max(x, min), max);
};

export const between = (min: number, max: number, x: number) => {
  return x >= min && x <= max;
};

export const betweenVector = (min: BABYLON.Vector3, max: BABYLON.Vector3, p: BABYLON.Vector3) => {
  return between(min.x, max.x, p.x) && between(min.y, max.y, p.y) && between(min.z, max.z, p.z);
};

export const roundVector = (p: BABYLON.Vector3) => {
  return new BABYLON.Vector3(
    Math.round(p.x),
    Math.round(p.y),
    Math.round(p.z)
  );
};

export const minVector = (a: BABYLON.Vector3, b: BABYLON.Vector3) => {
  return new BABYLON.Vector3(
    Math.min(a.x, b.x),
    Math.min(a.y, b.y),
    Math.min(a.z, b.z)
  );
};

export const maxVector = (a: BABYLON.Vector3, b: BABYLON.Vector3) => {
  return new BABYLON.Vector3(
    Math.max(a.x, b.x),
    Math.max(a.y, b.y),
    Math.max(a.z, b.z)
  );
};

export const clipVector = (min: number, max: number, p: BABYLON.Vector3) => {
  return new BABYLON.Vector3(
    clip(min, max, p.x),
    clip(min, max, p.y),
    clip(min, max, p.z)
  );
}