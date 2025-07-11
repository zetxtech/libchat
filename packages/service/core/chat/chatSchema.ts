import { connectionMongo, getMongoModel } from '../../common/mongo';
const { Schema } = connectionMongo;
import { type ChatSchema as ChatType } from '@libchat/global/core/chat/type.d';
import { ChatSourceEnum, ChatSourceMap } from '@libchat/global/core/chat/constants';
import {
  TeamCollectionName,
  TeamMemberCollectionName
} from '@libchat/global/support/user/team/constant';
import { AppCollectionName } from '../app/schema';

export const chatCollectionName = 'chat';

const ChatSchema = new Schema({
  chatId: {
    type: String,
    require: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user'
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
  createTime: {
    type: Date,
    default: () => new Date()
  },
  updateTime: {
    type: Date,
    default: () => new Date()
  },
  title: {
    type: String,
    default: '历史记录'
  },
  customTitle: {
    type: String,
    default: ''
  },
  top: {
    type: Boolean,
    default: false
  },
  source: {
    type: String,
    required: true,
    enum: Object.values(ChatSourceEnum)
  },
  sourceName: String,
  shareId: {
    type: String
  },
  outLinkUid: {
    type: String
  },

  variableList: {
    type: Array
  },
  welcomeText: {
    type: String
  },
  variables: {
    // variable value
    type: Object,
    default: {}
  },
  pluginInputs: Array,
  metadata: {
    //For special storage
    type: Object,
    default: {}
  }
});

try {
  ChatSchema.index({ chatId: 1 });
  // get user history
  ChatSchema.index({ tmbId: 1, appId: 1, top: -1, updateTime: -1 });
  // delete by appid; clear history; init chat; update chat; auth chat; get chat;
  ChatSchema.index({ appId: 1, chatId: 1 });

  // get chat logs;
  ChatSchema.index({ teamId: 1, appId: 1, updateTime: -1, sources: 1 });
  // get share chat history
  ChatSchema.index({ shareId: 1, outLinkUid: 1, updateTime: -1 });

  // timer, clear history
  ChatSchema.index({ teamId: 1, updateTime: -1 });
} catch (error) {
  console.log(error);
}

export const MongoChat = getMongoModel<ChatType>(chatCollectionName, ChatSchema);
