<script lang="ts">
	import { apiFetch } from '$lib/api';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	let email = $state(page.url.searchParams.get('email') || '');
	let code = $state('');
	let newPassword = $state('');
	let errorMsg = $state('');
	let successMsg = $state('');
	let isLoading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		isLoading = true;
		errorMsg = '';
		successMsg = '';
		
		try {
			const res = await apiFetch('/auth/reset-password', {
				method: 'POST',
				body: JSON.stringify({ email, code, newPassword })
			});
			
			if (res.ok) {
				successMsg = 'Senha redefinida com sucesso! Você já pode fazer login.';
				setTimeout(() => goto('/login'), 2000);
			} else {
				const data = await res.json();
				errorMsg = data.error || 'Erro ao redefinir senha.';
			}
		} catch (err) {
			errorMsg = 'Erro de conexão com o servidor.';
		} finally {
			isLoading = false;
		}
	}
</script>

<main class="landing-container">
	<div class="glass-card auth-card">
		<h2 class="logo" style="font-size: 2rem;">Nova Senha</h2>
		<p class="subtitle" style="margin-bottom: 1.5rem;">Use o código enviado para o seu e-mail</p>
		
		{#if errorMsg}
			<div class="error-msg">{errorMsg}</div>
		{/if}
		{#if successMsg}
			<div class="success-msg">{successMsg}</div>
		{/if}

		<form onsubmit={handleSubmit} class="auth-form">
			<div class="form-group">
				<label for="email">E-mail</label>
				<input type="email" id="email" bind:value={email} required readonly />
			</div>

			<div class="form-group">
				<label for="code">Código de Recuperação</label>
				<input type="text" id="code" bind:value={code} required minlength="6" maxlength="6" placeholder="000000" style="text-align: center; letter-spacing: 5px;" />
			</div>

			<div class="form-group">
				<label for="newPassword">Nova Senha</label>
				<input type="password" id="newPassword" bind:value={newPassword} required minlength="8" placeholder="Mínimo 8 caracteres" />
			</div>

			<button type="submit" class="btn btn-primary" disabled={isLoading || successMsg !== ''}>
				{isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
			</button>
		</form>
	</div>
</main>
