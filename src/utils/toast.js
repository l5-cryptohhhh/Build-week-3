// CustomEvent globale: disaccoppia chi genera il messaggio (middleware,
// componenti) da chi lo mostra (ToastHost), senza bisogno di passare
// dispatch/props ovunque.
export function showToast(message, variant = 'success') {
  window.dispatchEvent(new CustomEvent('toast:show', { detail: { message, variant } }))
}
