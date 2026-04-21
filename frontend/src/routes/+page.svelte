<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { isAuthenticated } from '$lib/api';

	onMount(() => {
		if (isAuthenticated()) {
			goto('/dashboard');
		}
	});

	function handleLogin() {
		goto('/login');
	}

	function handleRegister() {
		goto('/register');
	}
</script>

<main class="landing-container">
	<div class="glass-card">
		<h1 class="logo">LCO Sistemas <span class="version-text">v1.6.0</span></h1>
		<p class="subtitle">Bem-vindo. Acesse ou crie sua conta para continuar.</p>
		<div class="actions">
			<button class="btn btn-primary" onclick={handleLogin}>Fazer login</button>
			<button class="btn btn-secondary" onclick={handleRegister}>Criar conta</button>
		</div>
	</div>
</main>
