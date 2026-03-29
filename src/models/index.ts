import { User } from './User';
import { UserProfile } from './UserProfile';
import { RefreshToken } from './RefreshToken';
import { BillingOrder } from './BillingOrder';
import { BillingReceipt } from './BillingReceipt';
import { Entitlement } from './Entitlement';
import { AccountDeletionRequest } from './AccountDeletionRequest';
import { Feedback } from './Feedback';
import { Report } from './Report';
import { UserBlock } from './UserBlock';
import { RecommendationCandidate } from './RecommendationCandidate';

User.hasOne(UserProfile, { foreignKey: 'user_id', as: 'profile' });
UserProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(RefreshToken, { foreignKey: 'user_id', as: 'refresh_tokens' });
RefreshToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(BillingOrder, { foreignKey: 'user_id', as: 'billing_orders' });
BillingOrder.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

BillingOrder.hasMany(BillingReceipt, { foreignKey: 'order_id', as: 'receipts' });
BillingReceipt.belongsTo(BillingOrder, { foreignKey: 'order_id', as: 'order' });

User.hasMany(Entitlement, { foreignKey: 'user_id', as: 'entitlements' });
Entitlement.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(AccountDeletionRequest, { foreignKey: 'user_id', as: 'deletion_requests' });
AccountDeletionRequest.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Feedback, { foreignKey: 'user_id', as: 'feedbacks' });
Feedback.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Report, { foreignKey: 'user_id', as: 'reports' });
Report.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(UserBlock, { foreignKey: 'user_id', as: 'blocks' });
UserBlock.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(RecommendationCandidate, { foreignKey: 'user_id', as: 'recommendation_candidates' });
RecommendationCandidate.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

export {
  User,
  UserProfile,
  RefreshToken,
  BillingOrder,
  BillingReceipt,
  Entitlement,
  AccountDeletionRequest,
  Feedback,
  Report,
  UserBlock,
  RecommendationCandidate
};
