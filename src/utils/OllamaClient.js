export class OllamaClient {
  constructor(baseUrl = 'http://localhost:11434') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async testConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch (error) {
      console.error('Connection failed:', error);
      return false;
    }
  }

  async listModels() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) throw new Error('Failed to fetch models');
      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.error('List models failed:', error);
      throw error;
    }
  }

  async chat(model, messages, onChunk) {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let fullThinking = '';
      let combined = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const json = JSON.parse(line);
            let updated = false;

            // Handle content
            if (json.message?.content !== undefined) {
              fullContent += json.message.content;
              updated = true;
            } else if (json.response !== undefined) {
              fullContent += json.response;
              updated = true;
            }

            // Handle thinking (Ollama API extracts thinking into a separate field for some models)
            if (json.message?.thinking !== undefined) {
              fullThinking += json.message.thinking;
              updated = true;
            } else if (json.thinking !== undefined) {
              fullThinking += json.thinking;
              updated = true;
            }

            if (updated || json.done) {
              combined = fullContent;
              
              // If we received out-of-band thinking, wrap it in <think> tags for the UI
              if (fullThinking && !fullContent.includes('<think>')) {
                combined = `<think>\n${fullThinking}`;
                // Close the tag if content has started or stream is done
                if (fullContent.length > 0 || json.done) {
                  combined += `\n</think>\n\n`;
                }
                combined += fullContent;
              }

              onChunk(combined, json.done || false);
            }
          } catch (e) {
            console.warn('Failed to parse chunk:', line);
          }
        }
      }
    } catch (error) {
      console.error('Chat failed:', error);
      throw error;
    }
  }
}
