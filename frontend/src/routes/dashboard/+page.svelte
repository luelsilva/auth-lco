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
	let isChangingPassword = $state(false);
	let oldPassword = $state('');
	let newPassword = $state('');
	let changePasswordError = $state('');
	let changePasswordSuccess = $state('');

	async function handleChangePassword(e: Event) {
		e.preventDefault();
		changePasswordError = '';
		changePasswordSuccess = '';
		isLoading = true;

		try {
			const res = await apiFetch('/auth/change-password', {
				method: 'POST',
				body: JSON.stringify({ oldPassword, newPassword })
			});
			const data = await res.json();

			if (!res.ok) {
				changePasswordError = data.error || 'Erro ao alterar senha.';
			} else {
				changePasswordSuccess = 'Senha alterada com sucesso!';
				oldPassword = '';
				newPassword = '';
				setTimeout(() => isChangingPassword = false, 2000);
			}
		} catch (err) {
			changePasswordError = 'Erro de conexão.';
		} finally {
			isLoading = false;
		}
	}
</script>

<main class="landing-container">
	<div class="glass-card dashboard-card">
		{#if isLoading && !isChangingPassword}
			<h2 class="logo" style="font-size: 2rem;">Carregando...</h2>
		{:else if errorMsg}
			<div class="error-msg">{errorMsg}</div>
			<button class="btn btn-secondary" onclick={() => goto('/login')}>Voltar ao Login</button>
		{:else if user}
			<h2 class="logo" style="font-size: 2rem;">Área Logada <span class="version-text">v1.5.0</span></h2>
			
			{#if isChangingPassword}
				<div class="change-password-section">
					<h3>Alterar Senha</h3>
					{#if changePasswordError}
						<div class="error-msg">{changePasswordError}</div>
					{/if}
					{#if changePasswordSuccess}
						<div class="success-msg">{changePasswordSuccess}</div>
					{/if}

					<form onsubmit={handleChangePassword} class="auth-form">
						<div class="form-group">
							<label for="oldPassword">Senha Atual</label>
							<input type="password" id="oldPassword" bind:value={oldPassword} required />
						</div>
						<div class="form-group">
							<label for="newPassword">Nova Senha</label>
							<input type="password" id="newPassword" bind:value={newPassword} required minlength="8" />
						</div>
						<div class="actions-row">
							<button type="submit" class="btn btn-primary" disabled={isLoading}>
								{isLoading ? 'Salvando...' : 'Salvar Nova Senha'}
							</button>
							<button type="button" class="btn btn-secondary" onclick={() => isChangingPassword = false}>Cancelar</button>
						</div>
					</form>
				</div>
			{:else}
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
					<button class="btn btn-primary" onclick={() => isChangingPassword = true}>Alterar Senha</button>
					<button class="btn btn-secondary logout-btn" onclick={logout}>Sair da Conta (Logout)</button>
				</div>
			{/if}
		{/if}
	</div>
</main>
