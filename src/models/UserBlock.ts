import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface UserBlockAttributes {
  id: string;
  user_id: string;
  target_user_id: string;
  created_at?: Date;
  updated_at?: Date;
}

type UserBlockCreationAttributes = Optional<UserBlockAttributes, 'id'>;

export class UserBlock extends Model<UserBlockAttributes, UserBlockCreationAttributes> implements UserBlockAttributes {
  public id!: string;
  public user_id!: string;
  public target_user_id!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

UserBlock.init(
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
    target_user_id: {
      type: DataTypes.UUID,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: 'user_blocks',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);
