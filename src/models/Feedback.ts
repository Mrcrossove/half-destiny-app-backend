import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface FeedbackAttributes {
  id: string;
  user_id: string;
  type: string;
  content: string;
  contact: string | null;
  created_at?: Date;
  updated_at?: Date;
}

type FeedbackCreationAttributes = Optional<FeedbackAttributes, 'id' | 'contact' | 'type'>;

export class Feedback extends Model<FeedbackAttributes, FeedbackCreationAttributes> implements FeedbackAttributes {
  public id!: string;
  public user_id!: string;
  public type!: string;
  public content!: string;
  public contact!: string | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Feedback.init(
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
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'suggestion'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    contact: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'feedbacks',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);
