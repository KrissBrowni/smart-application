import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export async function hashPasswort(passwort: string): Promise<string> {
  return bcrypt.hash(passwort, SALT_ROUNDS);
}

export async function passwortVergleichen(
  passwort: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(passwort, hash);
}
