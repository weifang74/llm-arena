import React from 'react';
import { List, Button, Typography, Divider } from 'antd';
import { PlusOutlined, MessageOutlined } from '@ant-design/icons';

const { Text } = Typography;

// 对话列表组件
const ConversationList = ({ conversations, activeConversation, onSelect, onCreateNew }) => {
  return (
    <div style={{ height: 'calc(100% - 60px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '0 16px 16px' }}>
        <Button 
          type="dashed" 
          icon={<PlusOutlined />} 
          onClick={onCreateNew}
          style={{ width: '100%' }}
        >
          新建对话
        </Button>
      </div>
      
      <div style={{ flex: 1, overflow: 'auto' }}>
        <List
          dataSource={conversations}
          renderItem={item => (
            <List.Item
              key={item.id}
              onClick={() => onSelect(item)}
              style={{ 
                padding: '12px 16px',
                cursor: 'pointer',
                backgroundColor: activeConversation && activeConversation.id === item.id ? '#e6f7ff' : 'transparent',
                borderLeft: activeConversation && activeConversation.id === item.id ? '3px solid #1890ff' : '3px solid transparent'
              }}
            >
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong ellipsis style={{ maxWidth: '70%' }}>
                    {item.title}
                  </Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {new Date(item.timestamp).toLocaleDateString()}
                  </Text>
                </div>
                <div style={{ marginTop: '4px' }}>
                  <Text type="secondary" ellipsis>
                    {item.messages.length > 0 
                      ? (item.messages[item.messages.length - 1].sender === 'user' 
                        ? item.messages[item.messages.length - 1].content 
                        : `${item.messages[item.messages.length - 1].modelName}: ${item.messages[item.messages.length - 1].content}`)
                      : '无消息'
                    }
                  </Text>
                </div>
                <div style={{ marginTop: '4px', fontSize: '12px' }}>
                  <Text type="secondary">
                    {item.messages.length > 0 ? `${item.messages.length} 条对话` : '开始新对话'}
                  </Text>
                </div>
              </div>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};

export default ConversationList;
