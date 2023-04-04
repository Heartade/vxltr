<script lang="ts">
	import welcome from '$lib/images/svelte-welcome.webp';
	import welcome_fallback from '$lib/images/svelte-welcome.png';
	import { onMount } from 'svelte';
	import * as BABYLON from 'babylonjs';
    import { VoxelIndex, MAP_SIZE } from '$lib/voxel-set';
	import Toolbox from './Toolbox.svelte';

	let canvas: HTMLCanvasElement;
	let engine: BABYLON.Engine;
	let scene: BABYLON.Scene;
	let camera: BABYLON.ArcRotateCamera;
	let light: BABYLON.HemisphericLight;
	let voxels: VoxelIndex;

	let pointerDown = [];
	onMount(() => {
		engine = new BABYLON.Engine(canvas, true);
		scene = new BABYLON.Scene(engine);
		camera = new BABYLON.ArcRotateCamera('camera', 0, 0, 0, new BABYLON.Vector3(MAP_SIZE/2, MAP_SIZE/2, MAP_SIZE/2), scene);
		camera.setPosition(new BABYLON.Vector3(MAP_SIZE*4, MAP_SIZE*4, MAP_SIZE*4));
		camera.attachControl(canvas, true);
		light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);
		voxels = new VoxelIndex(scene);

		engine.runRenderLoop(() => {
			scene.render();
		});

		scene.onPointerObservable.add((pointerInfo) => {
			switch (pointerInfo.type) {
				case BABYLON.PointerEventTypes.POINTERDOWN:

					console.log(pointerInfo.event.button)
					pointerDown.push(pointerInfo.event.button);
					break;
				case BABYLON.PointerEventTypes.POINTERUP:
				console.log(pointerInfo.event.button)
					pointerDown = pointerDown.filter((button) => button !== pointerInfo.event.button);
					break;
				case BABYLON.PointerEventTypes.POINTERMOVE:
				
					break;
			}
		});

		window.addEventListener('resize', () => {
			engine.resize();
		});
	});
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="vxltr. a web-based voxel art creator" />
</svelte:head>

<section class="flex grow flex-col">
	<Toolbox/>
	<canvas class="w-full flex grow" bind:this={canvas} />
</section>
<style>
</style>
