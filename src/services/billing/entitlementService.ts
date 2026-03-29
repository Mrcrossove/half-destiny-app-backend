import { Entitlement } from '../../models';

export async function listEntitlements(userId: string) {
  const rows = await Entitlement.findAll({
    where: { user_id: userId },
    order: [['created_at', 'DESC']]
  });

  return rows.map((row) => ({
    product_key: row.product_key,
    status: row.status,
    starts_at: row.starts_at,
    expires_at: row.expires_at
  }));
}
