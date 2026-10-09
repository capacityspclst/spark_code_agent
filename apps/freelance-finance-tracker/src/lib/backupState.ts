// Simple in-memory holder for the latest backup string and passphrase during the app session.
let latestBackup: string | null = null;
let latestPassphrase: string | null = null;

export function setLatestBackup(blob: string) {
  latestBackup = blob;
}

export function getLatestBackup(): string | null {
  return latestBackup;
}

export function setLatestPassphrase(pw: string) {
  latestPassphrase = pw;
}

export function getLatestPassphrase(): string | null {
  return latestPassphrase;
}
