<script lang="ts">
  export let selectedRecipes;
  export let onOpenCookbook: () => void;
  export let onGenerateShoppingList: () => void;
  export let onToggleCookSoon: (path: string) => void;

  function openCookbook() {
    onOpenCookbook();
  }

  function generateShoppingList() {
    onGenerateShoppingList();
  }
</script>

<div class="cookbook-menu">
  <h2>Cookbook Actions</h2>
  <button on:click={openCookbook}>Open Cookbook</button>
  <button on:click={generateShoppingList}>Generate Shopping List</button>

  <h2>Selected Recipes</h2>
  {#if $selectedRecipes.length > 0}
    <ul>
      {#each $selectedRecipes as recipe}
        <li>{recipe.name} <button class="toggle-btn" on:click={() => onToggleCookSoon(recipe.path)}>✓</button></li>
      {/each}
    </ul>
  {:else}
    <p>No selected recipes.</p>
  {/if}
</div>
