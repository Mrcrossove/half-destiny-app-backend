import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface AccountDeletionRequestAttributes {
  id: string;
  user_id: string;
  status: 'pending' | 'cancelled' | 'completed';
  reason: string | null;
  requested_at: Date;
  scheduled_delete_at: Date;
  cancelled_at: Date | null;
  completed_at: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

type AccountDeletionRequestCreationAttributes = Optional<
  AccountDeletionRequestAttributes,
  'id' | 'status' | 'reason' | 'cancelled_at' | 'completed_at'
>;

export class AccountDeletionRequest extends Model<AccountDeletionRequestAttributes, AccountDeletionRequestCreationAttributes> implements AccountDeletionRequestAttributes {
  public id!: string;
  public user_id!: string;
  public status!: 'pending' | 'cancelled' | 'completed';
  public reason!: string | null;
  public requested_at!: Date;
  public scheduled_delete_at!: Date;
  public cancelled_at!: Date | null;
  public completed_at!: Date | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

AccountDeletionRequest.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'cancelled', 'completed'),
      allowNull: false,
      defaultValue: 'pending'
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    requested_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    scheduled_delete_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    cancelled_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'account_deletion_requests',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);
