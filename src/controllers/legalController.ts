import { Request, Response } from 'express';
import { env } from '../config/env';

export async function getDocuments(_req: Request, res: Response) {
  return res.json({
    success: true,
    data: {
      privacy: { version: '2026-03-28', file: 'privacy-policy.en.md' },
      terms: { version: '2026-03-28', file: 'terms-of-service.en.md' },
      subscription: { version: '2026-03-28', file: 'auto-renewal-terms.en.md' },
      deletion: { version: '2026-03-28', file: 'account-deletion-policy.en.md' },
      support_email: env.supportEmail,
      legal_email: env.legalEmail
    }
  });
}
