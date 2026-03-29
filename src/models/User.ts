import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface UserAttributes {
  id: string;
  email: string;
  password_hash: string;
  status: 'active' | 'pending_deletion' | 'deleted';
  provider: 'email' | 'apple' | 'google';
  provider_id: string | null;
  created_at?: Date;
  updated_at?: Date;
}

type UserCreationAttributes = Optional<UserAttributes, 'id' | 'password_hash' | 'provider_id' | 'status'>;

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public password_hash!: string;
  public status!: 'active' | 'pending_deletion' | 'deleted';
  public provider!: 'email' | 'apple' | 'google';
  public provider_id!: string | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    },
    status: {
      type: DataTypes.ENUM('active', 'pending_deletion', 'deleted'),
      allowNull: false,
      defaultValue: 'active'
    },
    provider: {
      type: DataTypes.ENUM('email', 'apple', 'google'),
      allowNull: false,
      defaultValue: 'email'
    },
    provider_id: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'users',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);
