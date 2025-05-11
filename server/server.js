const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

// 模型配置路由
const configRoutes = require('./routes/configRoutes');
app.use('/api/config', configRoutes);

// 聊天路由
const chatRoutes = require('./routes/chatRoutes');
app.use('/api/chat', chatRoutes);

// 根路由
app.get('/', (req, res) => {
  res.json({ message: '多模型对比聊天后端服务器运行中' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: '服务器错误',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

app.listen(PORT, () => {
  console.log(`服务器在端口 ${PORT} 上运行`);
});
