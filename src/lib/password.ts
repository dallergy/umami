import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export function hashPassword(password: string, rounds = SALT_ROUNDS) {
  return bcrypt.hashSync(password, rounds);
}

// Hash of a random string at the default cost. Comparing against it when a user does not
// exist keeps login timing the same, so response times do not reveal valid usernames.
const DUMMY_PASSWORD_HASH = '$2b$10$LlVKcX797EhqfEATCXEH/eV7jBB/tzYJLmu89jqJrkoQLOEaLie5W';

export function checkPassword(password: string, passwordHash: string) {
  return bcrypt.compareSync(password, passwordHash);
}

/** Spends the same time as a real password check and always fails. */
export function checkPasswordForMissingUser(password: string) {
  bcrypt.compareSync(String(password ?? ''), DUMMY_PASSWORD_HASH);

  return false;
}
