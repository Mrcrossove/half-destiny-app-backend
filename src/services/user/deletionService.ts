import { Op, Transaction } from 'sequelize';
import { sequelize } from '../../config/database';
import { APP_DELETION_DAYS } from '../../utils/constants';
import {
  AccountDeletionRequest,
  BillingOrder,
  Entitlement,
  Feedback,
  RecommendationCandidate,
  RefreshToken,
  Report,
  User,
  UserBlock
} from '../../models';

export interface DeletionStatusPayload {
  status: string;
  requested_at?: Date | null;
  scheduled_delete_at?: Date | null;
  cancelled_at?: Date | null;
  completed_at?: Date | null;
  can_cancel: boolean;
}

function buildStatusPayload(row: AccountDeletionRequest | null): DeletionStatusPayload {
  if (!row) {
    return {
      status: 'active',
      can_cancel: false
    };
  }

  return {
    status: row.status,
    requested_at: row.requested_at,
    scheduled_delete_at: row.scheduled_delete_at,
    cancelled_at: row.cancelled_at,
    completed_at: row.completed_at,
    can_cancel: row.status === 'pending'
  };
}

async function getLatestDeletionRequest(
  userId: string,
  status?: 'pending' | 'cancelled' | 'completed',
  transaction?: Transaction
) {
  return AccountDeletionRequest.findOne({
    where: {
      user_id: userId,
      ...(status ? { status } : {})
    },
    order: [['created_at', 'DESC']],
    transaction
  });
}

export async function createDeletionRequest(userId: string, reason: string | null) {
  return sequelize.transaction(async (transaction) => {
    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      throw new Error('User not found');
    }

    const existingPending = await getLatestDeletionRequest(userId, 'pending', transaction);
    if (existingPending) {
      throw new Error('A pending deletion request already exists');
    }

    const requestedAt = new Date();
    const scheduledDeleteAt = new Date(requestedAt.getTime() + APP_DELETION_DAYS * 24 * 60 * 60 * 1000);

    await user.update({ status: 'pending_deletion' }, { transaction });

    return AccountDeletionRequest.create(
      {
        user_id: userId,
        reason,
        requested_at: requestedAt,
        scheduled_delete_at: scheduledDeleteAt
      },
      { transaction }
    );
  });
}

export async function getDeletionStatusPayload(userId: string): Promise<DeletionStatusPayload> {
  const row = await getLatestDeletionRequest(userId);
  return buildStatusPayload(row);
}

export async function cancelDeletionRequest(userId: string) {
  return sequelize.transaction(async (transaction) => {
    const row = await AccountDeletionRequest.findOne({
      where: { user_id: userId, status: 'pending' },
      order: [['created_at', 'DESC']],
      transaction
    });

    if (!row) {
      return null;
    }

    await row.update(
      {
        status: 'cancelled',
        cancelled_at: new Date()
      },
      { transaction }
    );

    await User.update({ status: 'active' }, { where: { id: userId }, transaction });
    return row;
  });
}

export async function executeDueDeletionRequests() {
  const dueRequests = await AccountDeletionRequest.findAll({
    where: {
      status: 'pending',
      scheduled_delete_at: {
        [Op.lte]: new Date()
      }
    },
    order: [['scheduled_delete_at', 'ASC']]
  });

  let processedUsers = 0;
  let skippedUsers = 0;

  for (const request of dueRequests) {
    try {
      await sequelize.transaction(async (transaction) => {
        const freshRequest = await AccountDeletionRequest.findByPk(request.id, { transaction });
        if (!freshRequest || freshRequest.status !== 'pending') {
          skippedUsers += 1;
          return;
        }

        const userId = freshRequest.user_id;

        await Report.destroy({
          where: {
            [Op.or]: [{ user_id: userId }, { target_user_id: userId }]
          },
          transaction
        });

        await UserBlock.destroy({
          where: {
            [Op.or]: [{ user_id: userId }, { target_user_id: userId }]
          },
          transaction
        });

        await RecommendationCandidate.destroy({
          where: {
            [Op.or]: [{ user_id: userId }, { candidate_user_id: userId }]
          },
          transaction
        });

        await Feedback.destroy({ where: { user_id: userId }, transaction });
        await RefreshToken.destroy({ where: { user_id: userId }, transaction });
        await Entitlement.destroy({ where: { user_id: userId }, transaction });
        await BillingOrder.destroy({ where: { user_id: userId }, transaction });

        await AccountDeletionRequest.destroy({ where: { user_id: userId }, transaction });
        await User.destroy({ where: { id: userId }, transaction });
      });

      processedUsers += 1;
    } catch (error) {
      console.error('[deletion] failed to process request', request.id, error);
      skippedUsers += 1;
    }
  }

  return {
    scanned: dueRequests.length,
    processed: processedUsers,
    skipped: skippedUsers
  };
}
