// Mock responses for agent chat (used when VITE_USE_MOCK_AGENTS=true)

export function getAmaMockResponse(): string {
  return `I'd be happy to help you research that topic! In real mode, I can fetch information from the web. Currently in mock mode - switch to real mode to enable web fetching.`;
}

export function getDefaultMockResponse(): string {
  return `This is a mock response. Remove VITE_USE_MOCK_AGENTS to get actual AI responses.`;
}
