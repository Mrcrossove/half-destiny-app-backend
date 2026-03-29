import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface BillingReceiptAttributes {
  id: string;
  order_id: string;
  platform: 'apple' | 'google';
  receipt_payload: object | null;
  purchase_token: string | null;
  transaction_id: string | null;
  verified_at: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

type BillingReceiptCreationAttributes = Optional<BillingReceiptAttributes, 'id' | 'receipt_payload' | 'purchase_token' | 'transaction_id' | 'verified_at'>;

export class BillingReceipt extends Model<BillingReceiptAttributes, BillingReceiptCreationAttributes> implements BillingReceiptAttributes {
  public id!: string;
  public order_id!: string;
  public platform!: 'apple' | 'google';
  public receipt_payload!: object | null;
  public purchase_token!: string | null;
  public transaction_id!: string | null;
  public verified_at!: Date | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

BillingReceipt.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    platform: {
      type: DataTypes.ENUM('apple', 'google'),
      allowNull: false
    },
    receipt_payload: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    purchase_token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    transaction_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    verified_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'billing_receipts',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);
