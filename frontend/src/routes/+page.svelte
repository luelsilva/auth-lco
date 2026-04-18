<script lang="ts">
	import { goto } from '$app/navigation';

	// Svelte reactive block for changing routes via the old buttons
	// We've already replaced layout.css to have global styles, so we can use them!

	function handleLogin() {
		goto('/login');
	}

	function handleRegister() {
		goto('/register');
	}
</script>

<main class="landing-container">
	<div class="glass-card">
		<h1 class="logo">LCO Sistemas</h1>
		<p class="subtitle">Bem-vindo. Acesse ou crie sua conta para continuar.</p>
		<div class="actions">
			<button class="btn btn-primary" onclick={handleLogin}>Fazer login</button>
			<button class="btn btn-secondary" onclick={handleRegister}>Criar conta</button>
		</div>
	</div>
</main>
