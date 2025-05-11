// 模拟模型数据
export const mockModels = [
  {
    id: 'llama3-70b',
    name: 'Llama3-70B',
    api_key: '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',
    base_url: 'https://api.groq.com/openai/v1',
    api_type: 'openai',
    model: 'llama3-70b-8192',
    active: true,
    color: '#1890ff'
  },
  {
    id: 'llama3-8b',
    name: 'Llama3-8B',
    api_key: '9SLdiTnRp0rUo7WFTi91f006XIEhIwCV_w-QsUV_',
    base_url: 'https://api.cloudflare.com/client/v4/accounts/8e26f346c7f464b9b62389568cfbcbf0/ai/v1',
    api_type: 'openai',
    model: '@cf/meta/llama-3-8b-instruct',
    active: true,
    color: '#52c41a'
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    api_key: 'sk-...',
    base_url: 'https://api.openai.com/v1',
    api_type: 'openai',
    model: 'gpt-3.5-turbo',
    active: true,
    color: '#722ed1'
  }
];

// 模拟对话数据
export const mockConversations = [
  {
    id: 1,
    title: 'AI自我介绍',
    timestamp: '2025-04-20T11:40:17',
    messages: [
      {
        id: 101,
        content: '你是谁？',
        timestamp: '2025-04-20T11:40:17',
        sender: 'user'
      },
      {
        id: 102,
        modelId: 'llama3-70b',
        modelName: 'Llama3-70B',
        content: '我是Llama3-70B，一个由Meta开发的大型语言模型。我可以帮助回答问题、提供信息和进行对话。有什么我可以帮助你的吗？',
        timestamp: '2025-04-20T11:40:20',
        responseTime: 3000,
        sender: 'ai'
      },
      {
        id: 103,
        modelId: 'gpt-3.5-turbo',
        modelName: 'GPT-3.5 Turbo',
        content: '我是GPT-3.5 Turbo，由OpenAI开发的语言模型。我被设计用来理解和生成类似人类的文本。我可以帮助回答问题、提供信息、进行对话等。请问有什么我可以帮助你的吗？',
        timestamp: '2025-04-20T11:40:22',
        responseTime: 5000,
        sender: 'ai'
      }
    ]
  },
  {
    id: 2,
    title: '新的聊天',
    timestamp: '2025-04-20T11:38:23',
    messages: [
      {
        id: 201,
        content: '你好',
        timestamp: '2025-04-20T11:38:23',
        sender: 'user'
      },
      {
        id: 202,
        modelId: 'llama3-70b',
        modelName: 'Llama3-70B',
        content: '你好！有什么我可以帮助你的吗？',
        timestamp: '2025-04-20T11:38:25',
        responseTime: 2000,
        sender: 'ai'
      },
      {
        id: 203,
        modelId: 'gpt-3.5-turbo',
        modelName: 'GPT-3.5 Turbo',
        content: '你好！很高兴见到你。我是GPT-3.5 Turbo，一个AI助手。我能回答问题、提供信息或者聊天。请问今天有什么我可以帮助你的吗？',
        timestamp: '2025-04-20T11:38:26',
        responseTime: 3000,
        sender: 'ai'
      }
    ]
  },
  {
    id: 3,
    title: '新的聊天',
    timestamp: '2025-04-20T10:56:27',
    messages: []
  },
  {
    id: 4,
    title: '新的聊天',
    timestamp: '2025-04-19T22:22:47',
    messages: []
  }
];
