export async function verifyGoogleIdToken(token: string) {
  return {
    provider: 'google',
    providerId: token ? 'google-placeholder' : ''
  };
}
