<script lang="ts">
	import { goto } from '$app/navigation';
	import { apiFetch } from '$lib/api';

	let fullName = $state('');
	let email = $state('');
	let password = $state('');
	let errorMsg = $state('');
	let isLoading = $state(false);
	let showPassword = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		isLoading = true;
		errorMsg = '';
		
		try {
			const res = await apiFetch('/auth/register', {
				method: 'POST',
				body: JSON.stringify({ email, password, full_name: fullName })
			});
			const data = await res.json();
			
			if (!res.ok) {
				console.error('[REGISTER ERROR]', data);
				errorMsg = data.error || 'Erro ao registrar. Verifique os dados.';
				return;
			}
			
			// Success! Redirect to verify OTP
			goto(`/verify-otp?email=${encodeURIComponent(email)}`);
		} catch (err) {
			errorMsg = 'Erro de conexão com o servidor.';
		} finally {
			isLoading = false;
		}
	}
</script>

<main class="landing-container">
	<div class="glass-card auth-card">
		<h2 class="logo" style="font-size: 2rem;">Criar Conta</h2>
		<p class="subtitle" style="margin-bottom: 1.5rem;">Crie sua conta na LCO Sistemas <span class="version-text">v1.5.0</span></p>
		
		{#if errorMsg}
			<div class="error-msg">{errorMsg}</div>
		{/if}

		<form onsubmit={handleSubmit} class="auth-form">
			<div class="form-group">
				<label for="fullName">Nome Completo</label>
				<input type="text" id="fullName" bind:value={fullName} required placeholder="João da Silva" />
			</div>

			<div class="form-group">
				<label for="email">E-mail</label>
				<input type="email" id="email" bind:value={email} required placeholder="seu@email.com" />
			</div>
			
			<div class="form-group">
				<label for="password">Senha</label>
				<div class="password-container">
					<input 
						type={showPassword ? "text" : "password"} 
						id="password" 
						bind:value={password} 
						required 
						minlength="8" 
						placeholder="No mínimo 8 caracteres" 
					/>
					<button 
						type="button" 
						class="password-toggle" 
						onclick={() => showPassword = !showPassword}
						aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
					>
						{#if showPassword}
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88L4.62 4.62M1 1l22 22M20.08 11.99a10.01 10.01 0 0 0-7.31-7.31M12 4.54a10 10 0 0 1 8 8M3.92 12.01a10.01 10.01 0 0 0 7.31 7.31M12 19.46a10 10 0 0 1-8-8M14.12 14.12a3 3 0 0 1-4.24-4.24M12 12v.01"/></svg>
						{:else}
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
						{/if}
					</button>
				</div>
			</div>

			<button type="submit" class="btn btn-primary" disabled={isLoading}>
				{isLoading ? 'Registrando...' : 'Criar Conta'}
			</button>
		</form>
		
		<div class="auth-links">
			<a href="/login">Já tem uma conta? Faça login.</a>
		</div>
	</div>
</main>
