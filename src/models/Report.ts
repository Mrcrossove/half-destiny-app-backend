import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface ReportAttributes {
  id: string;
  user_id: string;
  target_user_id: string;
  reason: string;
  detail: string | null;
  status: 'pending' | 'reviewed';
  created_at?: Date;
  updated_at?: Date;
}

type ReportCreationAttributes = Optional<ReportAttributes, 'id' | 'detail' | 'status'>;

export class Report extends Model<ReportAttributes, ReportCreationAttributes> implements ReportAttributes {
  public id!: string;
  public user_id!: string;
  public target_user_id!: string;
  public reason!: string;
  public detail!: string | null;
  public status!: 'pending' | 'reviewed';
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Report.init(
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
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false
    },
    detail: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'reviewed'),
      allowNull: false,
      defaultValue: 'pending'
    }
  },
  {
    sequelize,
    tableName: 'reports',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);
