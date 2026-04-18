/**
 * Formata um nome completo, capitalizando a primeira letra de cada palavra,
 * exceto preposições comuns (da, de, do, das, dos, e).
 *
 * @param {string} nomeCompleto O nome a ser formatado
 * @returns {string} O nome formatado
 */
export function formatarNome(nomeCompleto) {
  if (!nomeCompleto) return '';

  const excecoes = ['da', 'de', 'do', 'das', 'dos', 'e', 'em', 'no'];

  return nomeCompleto
    .toLowerCase()
    .split(/\s+/)
    .map((palavra, index) => {
      // Se não for a primeira palavra e estiver na lista de exceções, mantém minúscula
      if (index > 0 && excecoes.includes(palavra)) {
        return palavra;
      }

      // Caso contrário, capitaliza a primeira letra
      return palavra.charAt(0).toUpperCase() + palavra.slice(1);
    })
    .join(' ');
}
