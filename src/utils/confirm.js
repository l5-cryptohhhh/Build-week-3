// Stesso pattern a CustomEvent di toast.js: il chiamante non deve sapere
// nulla di dove/come viene renderizzato il modale (ConfirmModalHost).
export function requestConfirm({
  message,
  title = 'Conferma',
  confirmLabel = 'Conferma',
  variant = 'danger',
} = {}) {
  return new Promise((resolve) => {
    window.dispatchEvent(
      new CustomEvent('confirm:request', { detail: { message, title, confirmLabel, variant, resolve } }),
    )
  })
}
