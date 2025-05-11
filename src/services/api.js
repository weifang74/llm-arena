import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60秒超时
  headers: {
    'Content-Type': 'application/json'
  }
});

// 模型配置相关API
export const configApi = {
  // 获取所有模型配置
  getModels: async () => {
    try {
      const response = await api.get('/config');
      return response.data;
    } catch (error) {
      console.error('获取模型配置失败:', error);
      throw error;
    }
  },
  
  // 添加新模型
  addModel: async (modelData) => {
    try {
      const response = await api.post('/config', modelData);
      return response.data;
    } catch (error) {
      console.error('添加模型失败:', error);
      throw error;
    }
  },
  
  // 更新模型
  updateModel: async (modelId, modelData) => {
    try {
      const response = await api.put(`/config/${modelId}`, modelData);
      return response.data;
    } catch (error) {
      console.error('更新模型失败:', error);
      throw error;
    }
  },
  
  // 删除模型
  deleteModel: async (modelId) => {
    try {
      const response = await api.delete(`/config/${modelId}`);
      return response.data;
    } catch (error) {
      console.error('删除模型失败:', error);
      throw error;
    }
  },
  
  // 批量导入模型配置
  importModels: async (modelsData) => {
    try {
      const response = await api.post('/config/batch', modelsData);
      return response.data;
    } catch (error) {
      console.error('批量导入模型失败:', error);
      throw error;
    }
  }
};

// 聊天相关API
export const chatApi = {
  // 发送消息并获取各个模型的回复
  sendMessage: async (message, conversationId, modelIds, messageHistory = []) => {
    try {
      const response = await api.post('/chat', {
        message,
        conversationId,
        modelIds,
        messageHistory
      });
      return response.data;
    } catch (error) {
      console.error('发送消息失败:', error);
      throw error;
    }
  }
};

export default {
  config: configApi,
  chat: chatApi
};
