import React, { useState, useEffect } from 'react';
import { Drawer, List, Switch, Button, Typography, Input, Form, Space, Divider, Tag, Tooltip, Modal, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SaveOutlined, ApiOutlined } from '@ant-design/icons';
import { configApi } from '../services/api';

const { Text, Title } = Typography;

// 模型配置面板组件
const ModelConfigPanel = ({ visible, onClose, models, onUpdate }) => {
  const [editingModel, setEditingModel] = useState(null);
  const [localModels, setLocalModels] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 初始化本地模型数据
  useEffect(() => {
    setLocalModels([...models]);
  }, [models]);

  // 切换模型激活状态
  const toggleModelActive = (modelId) => {
    const updatedModels = localModels.map(model => 
      model.id === modelId ? { ...model, active: !model.active } : model
    );
    setLocalModels(updatedModels);
    onUpdate(updatedModels);
  };

  // 打开编辑模态框
  const handleEdit = (model) => {
    setEditingModel(model);
    form.setFieldsValue({
      name: model.name,
      api_key: model.api_key,
      base_url: model.base_url,
      model: model.model,
      api_type: model.api_type
    });
    setModalVisible(true);
  };

  // 打开添加模态框
  const handleAdd = () => {
    setEditingModel(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 保存模型配置
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      let updatedModels;
      
      if (editingModel) {
        // 更新现有模型
        const updatedModel = { 
          ...editingModel, 
          name: values.name,
          api_key: values.api_key,
          base_url: values.base_url,
          model: values.model,
          api_type: values.api_type
        };
        
        // 调用API更新模型
        await configApi.updateModel(editingModel.id, updatedModel);
        
        // 更新本地状态
        updatedModels = localModels.map(model => 
          model.id === editingModel.id ? updatedModel : model
        );
      } else {
        // 添加新模型
        const newModelData = {
          name: values.name,
          api_key: values.api_key,
          base_url: values.base_url,
          model: values.model,
          api_type: values.api_type,
          active: true,
          color: `#${Math.floor(Math.random()*16777215).toString(16)}`
        };
        
        // 调用API添加模型
        const newModel = await configApi.addModel(newModelData);
        
        // 更新本地状态
        updatedModels = [...localModels, newModel];
      }
      
      setLocalModels(updatedModels);
      onUpdate(updatedModels);
      setModalVisible(false);
      message.success('模型配置已保存');
    } catch (error) {
      console.error('保存模型失败:', error);
      message.error('保存模型失败: ' + (error.message || '未知错误'));
    }
  };

  // 删除模型
  const handleDelete = (modelId) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个模型配置吗？',
      onOk: async () => {
        try {
          // 调用API删除模型
          await configApi.deleteModel(modelId);
          
          // 更新本地状态
          const updatedModels = localModels.filter(model => model.id !== modelId);
          setLocalModels(updatedModels);
          onUpdate(updatedModels);
          message.success('模型已删除');
        } catch (error) {
          console.error('删除模型失败:', error);
          message.error('删除模型失败: ' + (error.message || '未知错误'));
        }
      }
    });
  };

  // 导入配置
  const handleImportConfig = () => {
    Modal.confirm({
      title: '导入配置',
      content: (
        <Input.TextArea 
          rows={10} 
          placeholder="粘贴JSON格式的配置..." 
          id="import-config-textarea"
        />
      ),
      onOk: async () => {
        try {
          const textarea = document.getElementById('import-config-textarea');
          const config = JSON.parse(textarea.value);
          
          if (Array.isArray(config)) {
            // 调用API批量导入模型
            const newModels = await configApi.importModels(config);
            
            // 更新本地状态
            const updatedModels = [...localModels, ...newModels];
            setLocalModels(updatedModels);
            onUpdate(updatedModels);
            message.success(`已成功导入 ${newModels.length} 个模型`);
          }
        } catch (error) {
          console.error('导入配置失败:', error);
          message.error('导入失败: ' + (error.message || '配置格式不正确'));
        }
      }
    });
  };

  return (
    <>
      <Drawer
        title="模型配置"
        placement="right"
        onClose={onClose}
        open={visible}
        width={400}
        extra={
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAdd}
            >
              添加模型
            </Button>
            <Button 
              icon={<ApiOutlined />} 
              onClick={handleImportConfig}
            >
              导入配置
            </Button>
          </Space>
        }
      >
        <List
          dataSource={localModels}
          renderItem={model => (
            <List.Item
              key={model.id}
              actions={[
                <Switch 
                  checked={model.active} 
                  onChange={() => toggleModelActive(model.id)} 
                />,
                <Button 
                  type="text" 
                  icon={<EditOutlined />} 
                  onClick={() => handleEdit(model)} 
                />,
                <Button 
                  type="text" 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={() => handleDelete(model.id)} 
                />
              ]}
            >
              <List.Item.Meta
                title={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div 
                      style={{ 
                        width: 16, 
                        height: 16, 
                        backgroundColor: model.color, 
                        borderRadius: '50%', 
                        marginRight: 8 
                      }} 
                    />
                    <Text strong>{model.name}</Text>
                  </div>
                }
                description={
                  <>
                    <div>
                      <Tag color="blue">{model.model}</Tag>
                      <Tag color="green">{model.api_type}</Tag>
                    </div>
                    <Tooltip title={model.base_url}>
                      <Text ellipsis style={{ maxWidth: 200 }} type="secondary">
                        {model.base_url}
                      </Text>
                    </Tooltip>
                  </>
                }
              />
            </List.Item>
          )}
        />
      </Drawer>

      <Modal
        title={editingModel ? "编辑模型" : "添加模型"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            取消
          </Button>,
          <Button key="save" type="primary" icon={<SaveOutlined />} onClick={handleSave}>
            保存
          </Button>
        ]}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="模型名称"
            rules={[{ required: true, message: '请输入模型名称' }]}
          >
            <Input placeholder="例如：GPT-4" />
          </Form.Item>
          
          <Form.Item
            name="model"
            label="模型标识符"
            rules={[{ required: true, message: '请输入模型标识符' }]}
          >
            <Input placeholder="例如：gpt-4" />
          </Form.Item>
          
          <Form.Item
            name="api_key"
            label="API密钥"
            rules={[{ required: true, message: '请输入API密钥' }]}
          >
            <Input.Password placeholder="您的API密钥" />
          </Form.Item>
          
          <Form.Item
            name="base_url"
            label="API基础URL"
            rules={[{ required: true, message: '请输入API基础URL' }]}
          >
            <Input placeholder="例如：https://api.openai.com/v1" />
          </Form.Item>
          
          <Form.Item
            name="api_type"
            label="API类型"
            initialValue="openai"
            rules={[{ required: true, message: '请输入API类型' }]}
          >
            <Input placeholder="例如：openai" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ModelConfigPanel;
