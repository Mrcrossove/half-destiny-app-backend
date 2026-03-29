import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface RecommendationCandidateAttributes {
  id: string;
  user_id: string;
  candidate_user_id: string;
  score: number;
  source: string;
  shown_at: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

type RecommendationCandidateCreationAttributes = Optional<RecommendationCandidateAttributes, 'id' | 'shown_at' | 'source' | 'score'>;

export class RecommendationCandidate extends Model<RecommendationCandidateAttributes, RecommendationCandidateCreationAttributes> implements RecommendationCandidateAttributes {
  public id!: string;
  public user_id!: string;
  public candidate_user_id!: string;
  public score!: number;
  public source!: string;
  public shown_at!: Date | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

RecommendationCandidate.init(
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
    candidate_user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    score: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
      defaultValue: 0
    },
    source: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'seed'
    },
    shown_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'recommendation_candidates',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);
