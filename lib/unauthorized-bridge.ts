/** Evita importar el store desde `api.ts` (dependencia circular). El layout registra `logout` una vez. */

type Callback = () => void

let onUnauthorized: Callback | null = null

export function registerUnauthorizedCallback(fn: Callback | null) {
  onUnauthorized = fn
}

export function notifySessionInvalid() {
  onUnauthorized?.()
}
