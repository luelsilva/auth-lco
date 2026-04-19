<script lang="ts">
	import { apiFetch } from '$lib/api';
	import { goto } from '$app/navigation';

	let email = $state('');
	let errorMsg = $state('');
	let successMsg = $state('');
	let isLoading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		isLoading = true;
		errorMsg = '';
		successMsg = '';
		
		try {
			const res = await apiFetch('/auth/forgot-password', {
				method: 'POST',
				body: JSON.stringify({ email })
			});
			
			if (res.ok) {
				successMsg = 'Se este e-mail estiver cadastrado, você receberá um código de recuperação em instantes.';
				setTimeout(() => {
					goto(`/reset-password?email=${encodeURIComponent(email)}`);
				}, 3000);
			} else {
				const data = await res.json();
				errorMsg = data.error || 'Erro ao processar solicitação.';
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
		<h2 class="logo" style="font-size: 2rem;">Recuperar Senha</h2>
		<p class="subtitle" style="margin-bottom: 1.5rem;">Enviaremos um código para o seu e-mail</p>
		
		{#if errorMsg}
			<div class="error-msg">{errorMsg}</div>
		{/if}
		{#if successMsg}
			<div class="success-msg">{successMsg}</div>
		{/if}

		<form onsubmit={handleSubmit} class="auth-form">
			<div class="form-group">
				<label for="email">E-mail</label>
				<input type="email" id="email" bind:value={email} required placeholder="seu@email.com" />
			</div>

			<button type="submit" class="btn btn-primary" disabled={isLoading || successMsg !== ''}>
				{isLoading ? 'Enviando...' : 'Enviar Código'}
			</button>
		</form>
		
		<div class="auth-links">
			<a href="/login">Lembrou a senha? Voltar ao login.</a>
		</div>
	</div>
</main>
