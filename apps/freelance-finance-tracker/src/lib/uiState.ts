// Simple mutable UI state for passing transient messages between screens.
let pendingSnack = '';
export function setPendingSnack(msg: string) { pendingSnack = msg; }
export function consumeSnack(): string { const msg = pendingSnack; pendingSnack = ''; return msg; }
