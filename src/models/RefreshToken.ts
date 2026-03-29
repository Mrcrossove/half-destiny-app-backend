import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface RefreshTokenAttributes {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  revoked_at: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

type RefreshTokenCreationAttributes = Optional<RefreshTokenAttributes, 'id' | 'revoked_at'>;

export class RefreshToken extends Model<RefreshTokenAttributes, RefreshTokenCreationAttributes> implements RefreshTokenAttributes {
  public id!: string;
  public user_id!: string;
  public token!: string;
  public expires_at!: Date;
  public revoked_at!: Date | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

RefreshToken.init(
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
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    revoked_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'refresh_tokens',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);
