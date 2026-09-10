import { api } from '@/lib/api';

export async function getAIResponse(userInput: string): Promise<string> {
  const data = await api.post<{ reply: string }>('/api/chat', { message: userInput });
  return data.reply;
}
