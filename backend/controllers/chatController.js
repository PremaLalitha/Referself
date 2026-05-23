let OpenAI;
let openai = null;
try {
  // Attempt to load the optional OpenAI SDK. If it's not installed, we'll fallback gracefully.
  OpenAI = require('openai').default || require('openai');
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
} catch (e) {
  console.warn('OpenAI SDK not available; skipping OpenAI integration. Install `openai` to enable it.');
}

const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const lowerMessage = message.toLowerCase().trim();

    // Default fallback responses (keeps original behaviour)
    let fallback = 'Sorry, I can help with basic app features. Try asking about uploading resources, logging in, or searching.';
    if (lowerMessage.includes('upload') || lowerMessage.includes('how to upload')) {
      fallback = 'To upload a resource: 1. Log in to your account. 2. Click "Upload Resource" in the navbar. 3. Fill in title, course, subject, select file or link. 4. Submit to share!';
    } else if (lowerMessage.includes('login') || lowerMessage.includes('sign in')) {
      fallback = 'To log in: 1. Go to the login page. 2. Enter your email and password. 3. Or use Google OAuth for quick sign-in. Forgot password? Use the forgot link.';
    } else if (lowerMessage.includes('search') || lowerMessage.includes('find resource')) {
      fallback = 'To search resources: 1. Go to Explore page. 2. Filter by subject (e.g., Java). 3. View or download from the list. Use subjects in navbar for specific topics.';
    } else if (lowerMessage.includes('signup') || lowerMessage.includes('register')) {
      fallback = 'To sign up: 1. Click Signup. 2. Enter email, password. 3. Verify OTP sent to email. 4. Or use Google for instant signup.';
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      fallback = 'Hi! I\'m the ReferSelf assistant. Ask me about using the app, like "how to upload a resource".';
    } else if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      fallback = 'I can help with: Uploading resources, logging in, searching, signing up. For advanced queries, contact support.';
    }

    // If OpenAI is configured, call it; otherwise return the fallback
    if (openai) {
      try {
        // Prefer chat completions (gpt-3.5-turbo) for conversational responses
        const chatResp = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful assistant for the ReferSelf app.' },
            { role: 'user', content: message },
          ],
          max_tokens: 250,
          temperature: 0.2,
        });
        const aiText = chatResp?.choices?.[0]?.message?.content?.trim();
        if (aiText) return res.json({ message: aiText });
      } catch (apiErr) {
        console.error('OpenAI chat error:', apiErr);
        // fallthrough to return fallback below
      }
    }

    // If OpenAI not configured, try Hugging Face Inference API as a free/alternative option
    const hfKey = process.env.HF_API_KEY;
    const hfModel = process.env.HF_MODEL || 'google/flan-t5-small';
    if (hfKey) {
      try {
        const hfUrl = `https://api-inference.huggingface.co/models/${hfModel}`;
        const hfResp = await fetch(hfUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${hfKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inputs: message }),
        });

        if (!hfResp.ok) {
          const errBody = await hfResp.text().catch(() => '');
          console.error('HF inference error:', hfResp.status, errBody);
        } else {
          // HF can return different response shapes depending on model and pipeline
          const json = await hfResp.json().catch(() => null);
          let hfText = null;
          if (Array.isArray(json) && json.length > 0) {
            // common for text-generation: [{generated_text: '...'}]
            hfText = json[0].generated_text || json[0].summary_text || json[0].text || null;
            if (!hfText) {
              // sometimes it's an array of tokens or plain strings
              hfText = json[0].text || json[0];
            }
          } else if (json && typeof json === 'object') {
            // some models return {error: '...'} or {generated_text: '...'}
            hfText = json.generated_text || json.summary_text || json.text || null;
          } else if (typeof json === 'string') {
            hfText = json;
          }

          if (hfText) {
            return res.json({ message: String(hfText).trim() });
          }
        }
      } catch (hfErr) {
        console.error('Hugging Face inference error:', hfErr);
        // fallthrough to fallback
      }
    }

    return res.json({ message: fallback });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { sendMessage };
