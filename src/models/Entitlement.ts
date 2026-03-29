import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface EntitlementAttributes {
  id: string;
  user_id: string;
  product_key: string;
  source: string;
  starts_at: Date | null;
  expires_at: Date | null;
  status: 'active' | 'expired' | 'revoked';
  created_at?: Date;
  updated_at?: Date;
}

type EntitlementCreationAttributes = Optional<EntitlementAttributes, 'id' | 'source' | 'starts_at' | 'expires_at' | 'status'>;

export class Entitlement extends Model<EntitlementAttributes, EntitlementCreationAttributes> implements EntitlementAttributes {
  public id!: string;
  public user_id!: string;
  public product_key!: string;
  public source!: string;
  public starts_at!: Date | null;
  public expires_at!: Date | null;
  public status!: 'active' | 'expired' | 'revoked';
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Entitlement.init(
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
    product_key: {
      type: DataTypes.STRING,
      allowNull: false
    },
    source: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'billing'
    },
    starts_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'expired', 'revoked'),
      allowNull: false,
      defaultValue: 'active'
    }
  },
  {
    sequelize,
    tableName: 'entitlements',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);
