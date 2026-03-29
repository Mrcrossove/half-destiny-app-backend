export async function getBaziPlaceholder(type: 'personal' | 'compatibility' | 'dayun' | 'liunian') {
  return {
    type,
    status: 'placeholder',
    message: 'Report generation will be implemented in the next phase.'
  };
}
