<script>
  import './styles.css'
  import Header from "./Header.svelte";
</script>

<div class="w-screen h-screen flex flex-col bg-slate-100">
	<Header/>
	<slot />
</div>

<style>
:global(.custom-icon) {
	margin: auto;
}
</style>
