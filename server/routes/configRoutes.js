const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const CONFIG_FILE_PATH = path.join(__dirname, '../data/modelConfig.json');

// 确保配置文件目录存在
const ensureConfigDir = async () => {
  const dirPath = path.dirname(CONFIG_FILE_PATH);
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (err) {
    console.error('创建目录失败:', err);
  }
};

// 获取配置文件
const getConfigFile = async () => {
  try {
    await ensureConfigDir();
    const data = await fs.readFile(CONFIG_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // 文件不存在，返回空数组
      return [];
    }
    throw error;
  }
};

// 保存配置文件
const saveConfigFile = async (config) => {
  await ensureConfigDir();
  await fs.writeFile(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), 'utf8');
};

// 获取所有模型配置
router.get('/', async (req, res) => {
  try {
    const config = await getConfigFile();
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: '获取配置失败', error: error.message });
  }
});

// 添加新模型配置
router.post('/', async (req, res) => {
  try {
    const config = await getConfigFile();
    const newModel = {
      id: `model-${Date.now()}`,
      ...req.body,
      active: true,
      color: req.body.color || `#${Math.floor(Math.random()*16777215).toString(16)}`
    };
    
    config.push(newModel);
    await saveConfigFile(config);
    
    res.status(201).json(newModel);
  } catch (error) {
    res.status(500).json({ message: '添加配置失败', error: error.message });
  }
});

// 更新模型配置
router.put('/:id', async (req, res) => {
  try {
    const config = await getConfigFile();
    const index = config.findIndex(model => model.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ message: '未找到模型配置' });
    }
    
    config[index] = { ...config[index], ...req.body };
    await saveConfigFile(config);
    
    res.json(config[index]);
  } catch (error) {
    res.status(500).json({ message: '更新配置失败', error: error.message });
  }
});

// 删除模型配置
router.delete('/:id', async (req, res) => {
  try {
    let config = await getConfigFile();
    config = config.filter(model => model.id !== req.params.id);
    await saveConfigFile(config);
    
    res.json({ message: '删除配置成功' });
  } catch (error) {
    res.status(500).json({ message: '删除配置失败', error: error.message });
  }
});

// 批量导入配置
router.post('/batch', async (req, res) => {
  try {
    const existingConfig = await getConfigFile();
    const newConfigs = req.body.map(item => ({
      id: `model-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: item.name || item.model.split('/').pop() || item.model,
      api_key: item.api_key,
      base_url: item.base_url,
      model: item.model,
      api_type: item.api_type || 'openai',
      active: true,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`
    }));
    
    const updatedConfig = [...existingConfig, ...newConfigs];
    await saveConfigFile(updatedConfig);
    
    res.status(201).json(newConfigs);
  } catch (error) {
    res.status(500).json({ message: '批量导入配置失败', error: error.message });
  }
});

module.exports = router;
