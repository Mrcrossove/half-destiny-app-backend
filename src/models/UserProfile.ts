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
  height_cm: number | null;
  job: string | null;
  school: string | null;
  mbti: string | null;
  constellation: string | null;
  interests: string[];
  photos: string[];
  profile_completed: boolean;
  created_at?: Date;
  updated_at?: Date;
}

type UserProfileCreationAttributes = Optional<
  UserProfileAttributes,
  'id' | 'birth_date' | 'birthplace' | 'bio' | 'avatar_url' | 'height_cm' | 'job' | 'school' | 'mbti' | 'constellation' | 'interests' | 'photos' | 'profile_completed'
>;

export class UserProfile extends Model<UserProfileAttributes, UserProfileCreationAttributes> implements UserProfileAttributes {
  public id!: string;
  public user_id!: string;
  public nickname!: string;
  public gender!: string;
  public birth_date!: Date | null;
  public birthplace!: string | null;
  public bio!: string | null;
  public avatar_url!: string | null;
  public height_cm!: number | null;
  public job!: string | null;
  public school!: string | null;
  public mbti!: string | null;
  public constellation!: string | null;
  public interests!: string[];
  public photos!: string[];
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
    height_cm: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    job: {
      type: DataTypes.STRING(120),
      allowNull: true
    },
    school: {
      type: DataTypes.STRING(160),
      allowNull: true
    },
    mbti: {
      type: DataTypes.STRING(16),
      allowNull: true
    },
    constellation: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    interests: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: false,
      defaultValue: []
    },
    photos: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: false,
      defaultValue: []
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
