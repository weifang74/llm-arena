import React from 'react';
import { Card, Typography, Avatar, Tag } from 'antd';
import { UserOutlined, RobotOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';

const { Text } = Typography;

// 聊天消息组件
const ChatMessage = ({ message, models }) => {
  // 用户消息
  if (message.sender === 'user') {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <Card 
          style={{ 
            maxWidth: '80%', 
            borderRadius: '8px',
            backgroundColor: '#f0f0f0'
          }}
          bodyStyle={{ padding: '12px' }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{ marginRight: '12px', flex: 1 }}>
              <Text>{message.content}</Text>
            </div>
            <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
          </div>
          <div style={{ textAlign: 'right', marginTop: '4px' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {new Date(message.timestamp).toLocaleTimeString()}
            </Text>
          </div>
        </Card>
      </div>
    );
  }
  
  // AI模型消息 - 纵向排列
  const model = models.find(m => m.id === message.modelId) || { color: '#722ed1' };
  
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px', width: '100%' }}>
      <Card 
        style={{ 
          width: '100%', 
          borderRadius: '8px',
          borderLeft: `3px solid ${model.color || '#722ed1'}`
        }}
        bodyStyle={{ padding: '12px' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <Avatar 
            icon={<RobotOutlined />} 
            style={{ backgroundColor: model.color || '#722ed1', marginRight: '12px' }} 
          />
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: '8px' }}>
              <Text strong>{message.modelName}</Text>
              {message.responseTime && (
                <Tag color="blue" style={{ marginLeft: '8px', fontSize: '12px' }}>
                  {(message.responseTime / 1000).toFixed(2)}s
                </Tag>
              )}
            </div>
            <div className="markdown-content">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right', marginTop: '4px' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {new Date(message.timestamp).toLocaleTimeString()}
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default ChatMessage;
