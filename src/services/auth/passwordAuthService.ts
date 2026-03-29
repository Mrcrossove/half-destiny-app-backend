import { User, UserProfile } from '../../models';
import { hashPassword } from '../../utils/password';

export async function registerPasswordUser(input: { email: string; password: string }) {
  const user = await User.create({
    email: input.email,
    password_hash: hashPassword(input.password),
    provider: 'email'
  });

  await UserProfile.create({
    user_id: user.id,
    nickname: input.email.split('@')[0],
    gender: ''
  });

  return user;
}

export async function buildPasswordResetToken(_email: string) {
  return 'reset-token-placeholder';
}
