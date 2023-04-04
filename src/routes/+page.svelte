<script lang="ts">
	import welcome from '$lib/images/svelte-welcome.webp';
	import welcome_fallback from '$lib/images/svelte-welcome.png';
	import { onMount } from 'svelte';
	import * as BABYLON from 'babylonjs';
    import { VoxelIndex, MAP_SIZE } from '$lib/voxel-set';

	let canvas: HTMLCanvasElement;
	let engine: BABYLON.Engine;
	let scene: BABYLON.Scene;
	let camera: BABYLON.ArcRotateCamera;
	let light: BABYLON.HemisphericLight;
	let voxels: VoxelIndex;

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

		window.addEventListener('resize', () => {
			engine.resize();
		});
	});
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<!-- <h1>
		<span class="welcome">
			<picture>
				<source srcset={welcome} type="image/webp" />
				<img src={welcome_fallback} alt="Welcome" />
			</picture>
		</span>

		to your new<br />SvelteKit app
	</h1> -->
	<canvas class="main-scene" bind:this={canvas} />
</section>

<style>
	.main-scene {
		width: 100%;
		height: 100%;
	}

	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}

	.welcome {
		display: block;
		position: relative;
		width: 100%;
		height: 0;
		padding: 0 0 calc(100% * 495 / 2048) 0;
	}

	.welcome img {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		display: block;
	}
</style>
