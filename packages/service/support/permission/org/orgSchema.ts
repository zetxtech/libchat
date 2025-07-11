import { TeamCollectionName } from '@libchat/global/support/user/team/constant';
import { OrgCollectionName } from '@libchat/global/support/user/team/org/constant';
import type { OrgSchemaType } from '@libchat/global/support/user/team/org/type';
import { connectionMongo, getMongoModel } from '../../../common/mongo';
import { OrgMemberCollectionName } from './orgMemberSchema';
import { getNanoid } from '@libchat/global/common/string/tools';
const { Schema } = connectionMongo;

export const OrgSchema = new Schema(
  {
    teamId: {
      type: Schema.Types.ObjectId,
      ref: TeamCollectionName,
      required: true
    },
    pathId: {
      // path id, only used for path
      type: String,
      required: true,
      default: () => getNanoid()
    },
    path: {
      type: String,
      required: function (this: OrgSchemaType) {
        return typeof this.path !== 'string';
      } // allow empty string, but not null
    },
    name: {
      type: String,
      required: true
    },
    avatar: String,
    description: String,
    updateTime: {
      type: Date,
      default: () => new Date()
    }
  },
  {
    // Auto update updateTime
    timestamps: {
      updatedAt: 'updateTime'
    }
  }
);

OrgSchema.virtual('members', {
  ref: OrgMemberCollectionName,
  localField: '_id',
  foreignField: 'orgId',
  match: function (this: OrgSchemaType) {
    return { teamId: this.teamId };
  }
});

try {
  OrgSchema.index({
    teamId: 1,
    path: 1
  });
  OrgSchema.index(
    {
      teamId: 1,
      pathId: 1
    },
    {
      unique: true
    }
  );
} catch (error) {
  console.log(error);
}

export const MongoOrgModel = getMongoModel<OrgSchemaType>(OrgCollectionName, OrgSchema);
