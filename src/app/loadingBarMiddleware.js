// Mostra la barra di caricamento globale (vedi TopLoadingBar) mentre almeno
// un thunk e' in corso, riusando lo stesso pattern a CustomEvent gia' usato
// per toast/confirm invece di aggiungere un'altra slice solo per un contatore.
export const loadingBarMiddleware = () => (next) => (action) => {
  if (typeof action.type === 'string') {
    if (action.type.endsWith('/pending')) {
      window.dispatchEvent(new CustomEvent('loadingbar:start'))
    } else if (action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected')) {
      window.dispatchEvent(new CustomEvent('loadingbar:stop'))
    }
  }
  return next(action)
}
