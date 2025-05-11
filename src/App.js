import React, { useState, useEffect } from 'react';
import { Layout, Input, Button, Row, Col, Card, Divider, Avatar, Typography, Spin, Tag, message } from 'antd';
import { SendOutlined, SettingOutlined, UserOutlined, RobotOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import './App.css';
import ModelConfigPanel from './components/ModelConfigPanel';
import ConversationList from './components/ConversationList';
import { mockModels, mockConversations } from './utils/mockData';
import { configApi, chatApi } from './services/api';

const { Header, Content, Sider } = Layout;
const { TextArea } = Input;
const { Title, Text } = Typography;

function App() {
  const [activeConversation, setActiveConversation] = useState(null);
  const [conversations, setConversations] = useState(mockConversations);
  const [models, setModels] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [configVisible, setConfigVisible] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // 获取模型配置
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setInitialLoading(true);
        // 从后端获取模型配置
        const modelData = await configApi.getModels();
        if (modelData && modelData.length > 0) {
          setModels(modelData);
        } else {
          // 后备方案：使用mock数据
          setModels(mockModels);
        }
      } catch (error) {
        console.error('获取模型配置失败:', error);
        message.error('获取模型配置失败，使用默认配置');
        setModels(mockModels);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchModels();
  }, []);

  // 初始化选择第一个对话
  useEffect(() => {
    if (conversations.length > 0 && !activeConversation) {
      setActiveConversation(conversations[0]);
    }
  }, [conversations, activeConversation]);

  // 发送消息
  const handleSendMessage = async () => {
    if (!message.trim()) return;
    if (!activeConversation) return;
    
    // 创建新的用户消息
    const userMessage = {
      id: Date.now(),
      content: message,
      timestamp: new Date().toISOString(),
      sender: 'user'
    };
    
    // 创建临时更新的对话，立即显示用户消息
    const tempConversation = {
      ...activeConversation,
      messages: [
        ...activeConversation.messages,
        userMessage
      ]
    };
    
    // 更新状态显示用户消息
    setActiveConversation(tempConversation);
    setConversations(conversations.map(conv => 
      conv.id === activeConversation.id ? tempConversation : conv
    ));
    
    // 清空输入框并设置加载状态
    setMessage('');
    setLoading(true);
    
    try {
      // 获取活跃模型的ID
      const activeModelIds = models
        .filter(model => model.active)
        .map(model => model.id);
      
      if (activeModelIds.length === 0) {
        throw new Error('没有活跃的模型');
      }
      
      // 获取当前对话的所有消息作为历史记录
      const messageHistory = activeConversation.messages;
      
      // 调用后端API发送消息，并传递消息历史
      const response = await chatApi.sendMessage(
        message, 
        activeConversation.id,
        activeModelIds,
        messageHistory
      );
      
      // 获取模型回复
      const { userMessage, modelResponses } = response;
      
      // 确保用户消息显示在前端，而不是使用前端创建的临时消息
      // 通过查找具有相同内容的最新用户消息，替换为从后端返回的用户消息
      const messagesWithoutTemp = activeConversation.messages.filter(
        msg => !(msg.sender === 'user' && msg.content === message)
      );
      
      // 更新对话，确保显示用户消息和所有模型回复
      const updatedConversation = {
        ...activeConversation,
        messages: [
          ...messagesWithoutTemp,
          userMessage,
          ...modelResponses
        ]
      };
      
      // 更新状态
      setActiveConversation(updatedConversation);
      setConversations(conversations.map(conv => 
        conv.id === activeConversation.id ? updatedConversation : conv
      ));
    } catch (error) {
      console.error('发送消息失败:', error);
      message.error('发送消息失败: ' + (error.message || '未知错误'));
      
      // 错误情况下添加一个错误消息
      const errorResponses = models
        .filter(model => model.active)
        .map(model => ({
          id: Date.now() + Math.random(),
          modelId: model.id,
          modelName: model.name,
          content: `请求失败: ${error.message || '服务器错误'}`,
          timestamp: new Date().toISOString(),
          responseTime: 0,
          sender: 'ai',
          error: true
        }));
      
      const updatedConversation = {
        ...activeConversation,
        messages: [
          ...activeConversation.messages,
          ...errorResponses
        ]
      };
      
      setActiveConversation(updatedConversation);
      setConversations(conversations.map(conv => 
        conv.id === activeConversation.id ? updatedConversation : conv
      ));
    } finally {
      setLoading(false);
    }
  };

  // 创建新对话
  const createNewConversation = () => {
    const newConversation = {
      id: Date.now(),
      title: `新的对话 ${conversations.length + 1}`,
      timestamp: new Date().toISOString(),
      messages: []
    };
    
    setConversations([newConversation, ...conversations]);
    setActiveConversation(newConversation);
  };

  // 切换对话
  const handleConversationSelect = (conversation) => {
    setActiveConversation(conversation);
  };

  // 切换模型配置面板
  const toggleConfigPanel = () => {
    setConfigVisible(!configVisible);
  };

  // 更新模型配置
  const handleModelUpdate = async (updatedModels) => {
    try {
      // 这里应该添加实际保存模型配置到后端的逻辑
      // 由于我们的配置面板处理的是前端状态，这里做简单处理
      setModels(updatedModels);
      
      // 更新模型激活状态示例
      // 实际项目中可能需要更复杂的逻辑处理不同操作
      for (const model of updatedModels) {
        await configApi.updateModel(model.id, { active: model.active });
      }
      
      message.success('模型配置已更新');
    } catch (error) {
      console.error('更新模型配置失败:', error);
      message.error('更新模型配置失败');
    }
  };
  
  // 根据用户消息获取相应的模型回复
  const getModelResponsesForUserMessage = (userMessageId) => {
    if (!activeConversation) return [];
    
    const allMessages = activeConversation.messages;
    const userMessageIndex = allMessages.findIndex(msg => msg.id === userMessageId);
    
    if (userMessageIndex === -1) return [];
    
    const responses = [];
    let i = userMessageIndex + 1;
    
    // 收集下一个用户消息前的所有模型回复
    while (i < allMessages.length && allMessages[i].sender === 'ai') {
      responses.push(allMessages[i]);
      i++;
    }
    
    return responses;
  };
  
  // 获取所有用户消息
  const getUserMessages = () => {
    if (!activeConversation) return [];
    return activeConversation.messages.filter(msg => msg.sender === 'user');
  };

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider width={250} theme="light" style={{ overflow: 'auto', borderRight: '1px solid #f0f0f0' }}>
        <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Title level={4} style={{ margin: 0 }}>LLM PK Arena</Title>
          <Button 
            type="text" 
            icon={<SettingOutlined />} 
            onClick={toggleConfigPanel}
          />
        </div>
        <Divider style={{ margin: '0 0 8px 0' }} />
        
        <ConversationList 
          conversations={conversations}
          activeConversation={activeConversation}
          onSelect={handleConversationSelect}
          onCreateNew={createNewConversation}
        />
      </Sider>
      
      {/* 主要内容区 - 自定义布局 */}
      <Layout>
        <Header style={{ background: '#fff', padding: '0 16px', borderBottom: '1px solid #f0f0f0', height: '64px', display: 'flex', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>
            {activeConversation ? activeConversation.title : '开始新对话'}
          </Title>
        </Header>
        
        <Content style={{ margin: '0', overflow: 'auto', padding: '0' }}>
          {/* 模型分栏布局 */}
          {activeConversation && (
            <Row gutter={0} style={{ height: 'calc(100% - 90px)', overflow: 'hidden' }}>
              {/* 遍历所有活跃的模型，为每个模型创建一个列 */}
              {models.filter(model => model.active).map((model, index) => (
                <Col 
                  key={model.id} 
                  span={24 / models.filter(m => m.active).length} 
                  style={{ 
                    height: '100%', 
                    borderRight: index < models.filter(m => m.active).length - 1 ? '1px solid #f0f0f0' : 'none',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {/* 模型标题 */}
                  <div style={{
                    padding: '8px 16px',
                    borderBottom: '1px solid #f0f0f0',
                    background: '#fafafa',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <Avatar 
                      icon={<RobotOutlined />} 
                      style={{ backgroundColor: model.color, marginRight: '8px' }} 
                      size="small"
                    />
                    <Text strong>{model.name}</Text>
                  </div>
                  
                  {/* 该模型的消息区 */}
                  <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
                    {getUserMessages().map((userMsg, msgIndex) => {
                      const modelResponses = getModelResponsesForUserMessage(userMsg.id);
                      const thisModelResponse = modelResponses.find(resp => resp.modelId === model.id);
                      
                      return (
                        <div key={`${model.id}-${userMsg.id}`} style={{ marginBottom: '24px' }}>
                          {/* 用户问题 */}
                          <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '8px', background: '#f5f5f5', padding: '12px', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff', marginRight: '8px' }} size="small" />
                              <Text strong>用户问题</Text>
                              <Text type="secondary" style={{ fontSize: '12px', marginLeft: 'auto' }}>
                                {new Date(userMsg.timestamp).toLocaleTimeString()}
                              </Text>
                            </div>
                            <div>
                              <Text>{userMsg.content}</Text>
                            </div>
                          </div>
                          
                          {/* 模型回复 */}
                          {thisModelResponse ? (
                            <div style={{ borderLeft: `3px solid ${model.color}`, paddingLeft: '12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                                {thisModelResponse.responseTime && (
                                  <Tag color="blue" style={{ fontSize: '12px', margin: 0 }}>
                                    {(thisModelResponse.responseTime / 1000).toFixed(2)}s
                                  </Tag>
                                )}
                                <Text type="secondary" style={{ fontSize: '12px', marginLeft: 'auto' }}>
                                  {new Date(thisModelResponse.timestamp).toLocaleTimeString()}
                                </Text>
                              </div>
                              <div className="markdown-content">
                                <ReactMarkdown>{thisModelResponse.content}</ReactMarkdown>
                              </div>
                            </div>
                          ) : (
                            <div style={{ color: '#999', fontStyle: 'italic', padding: '8px 0' }}>
                              没有回复
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
                    {/* 加载指示器 */}
                    {loading && (
                      <div style={{ textAlign: 'center', padding: '20px' }}>
                        <Spin size="small" />
                      </div>
                    )}
                  </div>
                </Col>
              ))}
            </Row>
          )}
          
          {/* 输入区域 */}
          <div style={{ padding: '16px', borderTop: '1px solid #f0f0f0', background: '#fff', height: '90px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <TextArea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="输入您的问题..."
                autoSize={{ minRows: 1, maxRows: 2 }}
                onPressEnter={(e) => {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                style={{ flex: 1, marginRight: '8px' }}
              />
              <Button 
                type="primary" 
                icon={<SendOutlined />} 
                onClick={handleSendMessage}
                loading={loading}
              >
                发送
              </Button>
            </div>
            <Text type="secondary" style={{ fontSize: '12px', marginTop: '4px' }}>
              按 Enter 发送，Shift + Enter 换行
            </Text>
          </div>
        </Content>
      </Layout>
      
      {/* 模型配置面板 */}
      <ModelConfigPanel 
        visible={configVisible} 
        onClose={toggleConfigPanel}
        models={models}
        onUpdate={handleModelUpdate}
      />
    </Layout>
  );
}

export default App;
