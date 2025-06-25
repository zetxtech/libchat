import { TeamMemberCollectionName } from '@libchat/global/support/user/team/constant';
import { connectionMongo, getMongoModel } from '../../../common/mongo';
import { MemberGroupCollectionName } from './memberGroupSchema';
import { type GroupMemberSchemaType } from '@libchat/global/support/permission/memberGroup/type';
import { GroupMemberRole } from '@libchat/global/support/permission/memberGroup/constant';
const { Schema } = connectionMongo;

export const GroupMemberCollectionName = 'team_group_members';

export const GroupMemberSchema = new Schema({
  groupId: {
    type: Schema.Types.ObjectId,
    ref: MemberGroupCollectionName,
    required: true
  },
  tmbId: {
    type: Schema.Types.ObjectId,
    ref: TeamMemberCollectionName,
    required: true
  },
  role: {
    type: String,
    enum: Object.values(GroupMemberRole),
    required: true,
    default: GroupMemberRole.member
  }
});

GroupMemberSchema.virtual('group', {
  ref: MemberGroupCollectionName,
  localField: 'groupId',
  foreignField: '_id',
  justOne: true
});

try {
  GroupMemberSchema.index({
    groupId: 1
  });

  GroupMemberSchema.index({
    tmbId: 1
  });
} catch (error) {
  console.log(error);
}

export const MongoGroupMemberModel = getMongoModel<GroupMemberSchemaType>(
  GroupMemberCollectionName,
  GroupMemberSchema
);
