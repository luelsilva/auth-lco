<script lang="ts">
	import { goto } from '$app/navigation';
	import { apiFetch } from '$lib/api';
	import { page } from '$app/state';

	let email = $state(page.url.searchParams.get('email') || '');
	let code = $state('');
	let errorMsg = $state('');
	let successMsg = $state('');
	let isLoading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		isLoading = true;
		errorMsg = '';
		successMsg = '';
		
		try {
			const res = await apiFetch('/auth/verify-otp', {
				method: 'POST',
				body: JSON.stringify({ email, code })
			});
			const data = await res.json();
			
			if (!res.ok) {
				errorMsg = data.error || 'Código inválido.';
				return;
			}
			
			// Success! Inform and redirect
			successMsg = 'Conta verificada com sucesso! Redirecionando para o login...';
			setTimeout(() => goto('/login'), 2000);
		} catch (err) {
			errorMsg = 'Erro de conexão com o servidor.';
		} finally {
			isLoading = false;
		}
	}

	async function resendCode() {
		if (!email) return;
		isLoading = true;
		errorMsg = '';
		successMsg = '';
		
		try {
			const res = await apiFetch('/auth/resend-otp', {
				method: 'POST',
				body: JSON.stringify({ email })
			});
			
			if (!res.ok) {
				const data = await res.json();
				errorMsg = data.error || 'Erro ao reenviar código.';
			} else {
				successMsg = 'Novo código enviado para ' + email;
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
		<h2 class="logo" style="font-size: 2rem;">Verificar E-mail</h2>
		<p class="subtitle" style="margin-bottom: 1.5rem;">Digite o código (6 dígitos) enviado para {email}</p>
		
		{#if errorMsg}
			<div class="error-msg">{errorMsg}</div>
		{/if}
		{#if successMsg}
			<div class="success-msg">{successMsg}</div>
		{/if}

		<form onsubmit={handleSubmit} class="auth-form">
			<div class="form-group" style="display: none;">
				<label for="email">E-mail</label>
				<input type="email" id="email" bind:value={email} required readonly />
			</div>
			
			<div class="form-group">
				<label for="code">Código OTP</label>
				<input type="text" id="code" bind:value={code} required minlength="6" maxlength="6" placeholder="000000" style="text-align: center; letter-spacing: 5px; font-size: 1.25rem;" />
			</div>

			<button type="submit" class="btn btn-primary" disabled={isLoading || successMsg !== ''}>
				{isLoading ? 'Verificando...' : 'Verificar Conta'}
			</button>
		</form>
		
		<div class="auth-links">
			<button type="button" class="btn-link" onclick={resendCode} disabled={isLoading || successMsg !== ''}>Reenviar código</button>
		</div>
	</div>
</main>
