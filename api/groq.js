const fetch = require('node-fetch');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    // Using llama-3.1-8b-instant - fastest model with 30,000 TPM limit
    const model = 'llama-3.1-8b-instant';
    
    // Truncate system prompt if too long (keep under 2000 chars)
    let systemPrompt = messages.find(m => m.role === 'system')?.content || '';
    if (systemPrompt.length > 3000) {
      systemPrompt = systemPrompt.substring(0, 3000);
    }

    // Truncate user message if too long
    let userMessage = messages.find(m => m.role === 'user')?.content || '';
    if (userMessage.length > 2000) {
      userMessage = userMessage.substring(0, 2000) + '... (truncated)';
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        temperature: 0.85,
        max_tokens: 4096,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Groq API Error:', data);
      throw new Error(data.error?.message || 'Groq API error');
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Sparrow Hawk API Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Sparrow Hawk crashed mid-flight! 🔥💥' 
    });
  }
};