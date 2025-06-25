import { connectionMongo, getMongoModel } from '../../common/mongo';
const { Schema } = connectionMongo;
import { type OutLinkSchema as SchemaType } from '@libchat/global/support/outLink/type';
import {
  TeamCollectionName,
  TeamMemberCollectionName
} from '@libchat/global/support/user/team/constant';
import { AppCollectionName } from '../../core/app/schema';

const OutLinkSchema = new Schema({
  shareId: {
    type: String,
    required: true
  },
  teamId: {
    type: Schema.Types.ObjectId,
    ref: TeamCollectionName,
    required: true
  },
  tmbId: {
    type: Schema.Types.ObjectId,
    ref: TeamMemberCollectionName,
    required: true
  },
  appId: {
    type: Schema.Types.ObjectId,
    ref: AppCollectionName,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  usagePoints: {
    type: Number,
    default: 0
  },
  lastTime: {
    type: Date
  },

  responseDetail: {
    type: Boolean,
    default: false
  },
  showNodeStatus: {
    type: Boolean,
    default: true
  },
  // showFullText: {
  //   type: Boolean
  // },
  showRawSource: {
    type: Boolean
  },
  limit: {
    maxUsagePoints: {
      type: Number,
      default: -1
    },
    expiredTime: {
      type: Date
    },
    QPM: {
      type: Number,
      default: 1000
    },
    hookUrl: {
      type: String
    }
  },

  // Third part app config
  app: {
    type: Object // could be FeishuAppType | WecomAppType | ...
  },
  immediateResponse: {
    type: String
  },
  defaultResponse: {
    type: String
  }
});

OutLinkSchema.virtual('associatedApp', {
  ref: AppCollectionName,
  localField: 'appId',
  foreignField: '_id',
  justOne: true
});

try {
  OutLinkSchema.index({ shareId: -1 });
  OutLinkSchema.index({ teamId: 1, tmbId: 1, appId: 1 });
} catch (error) {
  console.log(error);
}

export const MongoOutLink = getMongoModel<SchemaType>('outlinks', OutLinkSchema);
