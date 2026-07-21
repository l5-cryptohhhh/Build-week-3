import { showToast } from '../utils/toast'

// Mappa centralizzata "tipo di azione completata -> messaggio", invece di
// disseminare dispatch di toast in ogni componente/thunk: aggiungere un
// nuovo toast di conferma significa aggiungere una riga qui.
const SUCCESS_MESSAGES = {
  'posts/createPost/fulfilled': 'Post pubblicato.',
  'posts/deletePost/fulfilled': 'Post eliminato.',
  'comments/removeComment/fulfilled': 'Commento eliminato.',
  'messages/removeMessage/fulfilled': 'Messaggio eliminato.',
  'users/updateProfile/fulfilled': 'Profilo aggiornato.',
  'auth/register/fulfilled': 'Registrazione completata.',
}

export const toastMiddleware = () => (next) => (action) => {
  const message = SUCCESS_MESSAGES[action.type]
  if (message) showToast(message, 'success')
  return next(action)
}
