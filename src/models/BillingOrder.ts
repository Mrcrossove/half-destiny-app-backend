import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface BillingOrderAttributes {
  id: string;
  user_id: string;
  platform: 'apple' | 'google';
  product_id: string;
  product_type: 'subscription' | 'consumable';
  amount: number;
  currency: string;
  status: 'pending' | 'verified' | 'failed';
  created_at?: Date;
  updated_at?: Date;
}

type BillingOrderCreationAttributes = Optional<BillingOrderAttributes, 'id' | 'status'>;

export class BillingOrder extends Model<BillingOrderAttributes, BillingOrderCreationAttributes> implements BillingOrderAttributes {
  public id!: string;
  public user_id!: string;
  public platform!: 'apple' | 'google';
  public product_id!: string;
  public product_type!: 'subscription' | 'consumable';
  public amount!: number;
  public currency!: string;
  public status!: 'pending' | 'verified' | 'failed';
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

BillingOrder.init(
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
    platform: {
      type: DataTypes.ENUM('apple', 'google'),
      allowNull: false
    },
    product_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    product_type: {
      type: DataTypes.ENUM('subscription', 'consumable'),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'USD'
    },
    status: {
      type: DataTypes.ENUM('pending', 'verified', 'failed'),
      allowNull: false,
      defaultValue: 'pending'
    }
  },
  {
    sequelize,
    tableName: 'billing_orders',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);
