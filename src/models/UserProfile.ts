import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface UserProfileAttributes {
  id: string;
  user_id: string;
  nickname: string;
  gender: string;
  birth_date: Date | null;
  birth_time: string | null;
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
  current_luck_pillar: string | null;
  year_pillar: string | null;
  month_pillar: string | null;
  day_pillar: string | null;
  hour_pillar: string | null;
  day_element: string | null;
  body_strength: string | null;
  bazi_report: string | null;
  last_bazi_calculated_at: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

type UserProfileCreationAttributes = Optional<
  UserProfileAttributes,
  'id' | 'birth_date' | 'birth_time' | 'birthplace' | 'bio' | 'avatar_url' | 'height_cm' | 'job' | 'school' | 'mbti' | 'constellation' | 'interests' | 'photos' | 'profile_completed' | 'current_luck_pillar' | 'year_pillar' | 'month_pillar' | 'day_pillar' | 'hour_pillar' | 'day_element' | 'body_strength' | 'bazi_report' | 'last_bazi_calculated_at'
>;

export class UserProfile extends Model<UserProfileAttributes, UserProfileCreationAttributes> implements UserProfileAttributes {
  public id!: string;
  public user_id!: string;
  public nickname!: string;
  public gender!: string;
  public birth_date!: Date | null;
  public birth_time!: string | null;
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
  public current_luck_pillar!: string | null;
  public year_pillar!: string | null;
  public month_pillar!: string | null;
  public day_pillar!: string | null;
  public hour_pillar!: string | null;
  public day_element!: string | null;
  public body_strength!: string | null;
  public bazi_report!: string | null;
  public last_bazi_calculated_at!: Date | null;
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
    birth_time: {
      type: DataTypes.STRING(16),
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
    },
    current_luck_pillar: {
      type: DataTypes.STRING(16),
      allowNull: true
    },
    year_pillar: {
      type: DataTypes.STRING(16),
      allowNull: true
    },
    month_pillar: {
      type: DataTypes.STRING(16),
      allowNull: true
    },
    day_pillar: {
      type: DataTypes.STRING(16),
      allowNull: true
    },
    hour_pillar: {
      type: DataTypes.STRING(16),
      allowNull: true
    },
    day_element: {
      type: DataTypes.STRING(16),
      allowNull: true
    },
    body_strength: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    bazi_report: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    last_bazi_calculated_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'user_profiles',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);
