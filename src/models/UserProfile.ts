import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface UserProfileAttributes {
  id: string;
  user_id: string;
  nickname: string;
  gender: string;
  birth_date: Date | null;
  birthplace: string | null;
  bio: string | null;
  avatar_url: string | null;
  profile_completed: boolean;
  created_at?: Date;
  updated_at?: Date;
}

type UserProfileCreationAttributes = Optional<UserProfileAttributes, 'id' | 'birth_date' | 'birthplace' | 'bio' | 'avatar_url' | 'profile_completed'>;

export class UserProfile extends Model<UserProfileAttributes, UserProfileCreationAttributes> implements UserProfileAttributes {
  public id!: string;
  public user_id!: string;
  public nickname!: string;
  public gender!: string;
  public birth_date!: Date | null;
  public birthplace!: string | null;
  public bio!: string | null;
  public avatar_url!: string | null;
  public profile_completed!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

UserProfile.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true
    },
    nickname: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    },
    birth_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    birthplace: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    avatar_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    profile_completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    sequelize,
    tableName: 'user_profiles',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);
