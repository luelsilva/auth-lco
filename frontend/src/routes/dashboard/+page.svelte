<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { apiFetch, isAuthenticated, logout } from '$lib/api';

	let user = $state<{ id: string; email: string; fullName: string; isVerified: boolean; createdAt: string } | null>(null);
	let isLoading = $state(true);
	let errorMsg = $state('');

	onMount(async () => {
		if (!isAuthenticated()) {
			goto('/login');
			return;
		}

		try {
			const res = await apiFetch('/auth/me');
			if (res.ok) {
				user = await res.json();
			} else {
				// Failed to fetch data, possibly token expired or invalid
				logout();
			}
		} catch (err) {
			errorMsg = 'Erro de conexão ao carregar perfil.';
		} finally {
			isLoading = false;
		}
	});
</script>

<main class="landing-container">
	<div class="glass-card dashboard-card">
		{#if isLoading}
			<h2 class="logo" style="font-size: 2rem;">Carregando...</h2>
		{:else if errorMsg}
			<div class="error-msg">{errorMsg}</div>
			<button class="btn btn-secondary" onclick={() => goto('/login')}>Voltar ao Login</button>
		{:else if user}
			<h2 class="logo" style="font-size: 2rem;">Área Logada</h2>
			<div class="profile-info">
				<p><strong>Nome:</strong> {user.fullName}</p>
				<p><strong>E-mail:</strong> {user.email}</p>
				<p>
					<strong>Status da Conta:</strong> 
					<span class="badge {user.isVerified ? 'badge-success' : 'badge-warning'}">
						{user.isVerified ? 'Verificado' : 'Pendente'}
					</span>
				</p>
				<p><strong>Cadastrado em:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
			</div>
			
			<div class="actions" style="margin-top: 2rem;">
				<button class="btn btn-primary" onclick={() => alert('Feature não implementada neste demo')}>Alterar Senha</button>
				<button class="btn btn-secondary logout-btn" onclick={logout}>Sair da Conta (Logout)</button>
			</div>
		{/if}
	</div>
</main>
