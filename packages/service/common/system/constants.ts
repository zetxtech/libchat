export const LibChatProUrl = process.env.PRO_URL ? `${process.env.PRO_URL}/api` : '';
// @ts-ignore
export const isLibChatProService = () => !!global.systemConfig;
