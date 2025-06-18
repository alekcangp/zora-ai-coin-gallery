import type { SummaryResponse, ImageResponse, ArtStyle } from '../types';

export const cloudflareAI = {
  async summarizeText(text: string): Promise<string> {
    try {
      const response = await fetch('/api/ai-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: '@cf/facebook/bart-large-cnn',
          data: { 
            input_text: text// .substring(0, 1000), default: 1024 // Limit text length for better processing
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SummaryResponse = await response.json();
      
      if (data.success && data.result) {
        return data.result.summary;
      }
      
      throw new Error('Summarization failed');
    } catch (error) {
      console.error('Error summarizing text:', error);
      // Return mock summary for development
      return `A dynamic collection of innovative cryptocurrencies showcasing ${text.split(' ').slice(0, 5).join(' ')}... with cutting-edge blockchain technology and vibrant community ecosystems.`;
    }
  },

  async generateImage(prompt: string, style: ArtStyle): Promise<string> {
    try {
      const styledPrompt = `${style} artwork of: ${prompt}, highly detailed, digital art, vibrant colors, professional quality`;
      
      const response = await fetch('/api/ai-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          //@cf/bytedance/stable-diffusion-xl-lightning
          //@cf/stabilityai/stable-diffusion-xl-base-1.0
          endpoint: '@cf/stabilityai/stable-diffusion-xl-base-1.0',
          data: { 
            prompt: styledPrompt,
            num_steps: 20,
            guidance: 7.5
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ImageResponse = await response.json();
      
      if (data.success && data.result) {
        // The API now returns base64 string directly
        return `data:image/png;base64,${data.result}`;
      }
      
      throw new Error('Image generation failed');
    } catch (error) {
      console.error('Error generating image:', error);
      // Return placeholder image for development
      return `https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop`;
    }
  }
};