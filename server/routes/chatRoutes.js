const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const CONFIG_FILE_PATH = path.join(__dirname, '../data/modelConfig.json');

// 获取模型配置
const getModelConfig = async () => {
  try {
    const data = await fs.readFile(CONFIG_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
};

// 处理聊天请求
router.post('/', async (req, res) => {
  try {
    const { message, messageHistory, conversationId, modelIds } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: '消息不能为空' });
    }
    
    // 获取模型配置
    const allModels = await getModelConfig();
    
    // 筛选请求的模型
    const targetModels = modelIds && modelIds.length > 0
      ? allModels.filter(model => modelIds.includes(model.id))
      : allModels.filter(model => model.active);
    
    if (targetModels.length === 0) {
      return res.status(400).json({ message: '未找到可用模型' });
    }
    
    // 存储每个模型的请求开始时间
    const requestStartTimes = {};
    
    // 并行向所有模型发送请求
    const modelPromises = targetModels.map(async (model) => {
      try {
        requestStartTimes[model.id] = Date.now();
        
        // 传递消息历史到API调用
        const response = await callLLMApi(model, message, messageHistory || []);
        
        const responseTime = Date.now() - requestStartTimes[model.id];
        
        return {
          id: Date.now() + Math.random(),
          modelId: model.id,
          modelName: model.name,
          content: response,
          timestamp: new Date().toISOString(),
          responseTime,
          sender: 'ai'
        };
      } catch (error) {
        console.error(`模型 ${model.name} 请求失败:`, error);
        
        // 返回错误信息作为模型回复
        return {
          id: Date.now() + Math.random(),
          modelId: model.id,
          modelName: model.name,
          content: `请求失败: ${error.message || '未知错误'}`,
          timestamp: new Date().toISOString(),
          responseTime: Date.now() - requestStartTimes[model.id],
          sender: 'ai',
          error: true
        };
      }
    });
    
    // 等待所有模型响应
    const modelResponses = await Promise.all(modelPromises);
    
    // 构造用户消息对象
    const userMessage = {
      id: Date.now(),
      content: message,
      timestamp: new Date().toISOString(),
      sender: 'user'
    };
    
    res.json({
      userMessage,
      modelResponses
    });
  } catch (error) {
    console.error('处理聊天请求时出错:', error);
    res.status(500).json({ message: '处理请求失败', error: error.message });
  }
});

// 调用不同LLM API的函数
async function callLLMApi(model, message, messageHistory = []) {
  const { api_type, base_url, api_key, model: modelName } = model;
  
  // OpenAI兼容API调用 (适用于OpenAI, Azure OpenAI, Groq等)
  if (api_type === 'openai') {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${api_key}`
    };
    
    // 构造请求体，包含历史消息
    const messages = [];
    
    // 添加历史消息
    if (messageHistory && messageHistory.length > 0) {
      // 将历史消息格式化为OpenAI格式
      for (const msg of messageHistory) {
        messages.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      }
    }
    
    // 添加当前消息
    messages.push({ role: 'user', content: message });
    
    const requestBody = {
      model: modelName,
      messages: messages,
      temperature: 0.7,
      max_tokens: 800
    };
    
    // 判断是否是Cloudflare AI API
    if (base_url.includes('cloudflare.com')) {
      try {
        console.log(`调用Cloudflare API: ${modelName}`);
        
        // 为Cloudflare自定义请求URL
        const response = await axios.post(
          `${base_url}/chat/completions`, 
          requestBody,
          { 
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${api_key}`
            }
          }
        );
        
        if (response.data && response.data.choices && response.data.choices.length > 0) {
          return response.data.choices[0].message.content;
        }
        
        throw new Error('Cloudflare API返回格式异常');
      } catch (error) {
        console.error('Cloudflare API调用失败:', error.response?.data || error.message);
        throw error;
      }
    }
    
    // 判断是否是Groq API
    if (base_url.includes('groq.com')) {
      try {
        console.log(`调用Groq API: ${modelName}`);
        
        const response = await axios.post(
          `${base_url}/chat/completions`, 
          requestBody,
          { headers }
        );
        
        if (response.data && response.data.choices && response.data.choices.length > 0) {
          return response.data.choices[0].message.content;
        }
        
        throw new Error('Groq API返回格式异常');
      } catch (error) {
        console.error('Groq API调用失败:', error.response?.data || error.message);
        throw error;
      }
    }
    
    // 标准OpenAI API调用
    try {
      console.log(`调用标准OpenAI API: ${modelName}`);
      
      const response = await axios.post(
        `${base_url}/chat/completions`, 
        requestBody,
        { headers }
      );
      
      if (response.data && response.data.choices && response.data.choices.length > 0) {
        return response.data.choices[0].message.content;
      }
      
      throw new Error('API返回格式异常');
    } catch (error) {
      console.error('API调用失败:', error.response?.data || error.message);
      throw error;
    }
  }
  
  // 未支持的API类型
  throw new Error(`不支持的API类型: ${api_type}`);
}

module.exports = router;
