export async function verifyAppleIdentityToken(token: string) {
  return {
    provider: 'apple',
    providerId: token ? 'apple-placeholder' : ''
  };
}
