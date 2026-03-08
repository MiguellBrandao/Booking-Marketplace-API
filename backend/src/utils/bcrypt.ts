import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export async function hashValue(value: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(value, salt);
}

export async function compareValue(raw: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(raw, hashed);
}
