const GEMINI_API_KEY = 'AIzaSyBDn_jbMLPd80LafTjuQXQeaHpBRGw1n-U';
const GEMINI_MODEL = 'gemini-2.5-flash-lite';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// System prompt for the AI
const SYSTEM_PROMPT = `Bạn là VIA AI - một trợ lý AI toàn năng, thông minh và thân thiện. Bạn có kiến thức sâu rộng về mọi lĩnh vực bao gồm:
- Khoa học và công nghệ
- Y tế và sức khỏe
- Kinh doanh và tài chính
- Giáo dục và học thuật
- Nghệ thuật và giải trí
- Lịch sử và văn hóa
- Đời sống và kỹ năng mềm
- Lập trình và phát triển phần mềm
- Và nhiều lĩnh vực khác

Hãy trả lời một cách chính xác, hữu ích và dễ hiểu. Sử dụng tiếng Việt khi người dùng hỏi bằng tiếng Việt.

QUAN TRỌNG: KHÔNG sử dụng bất kỳ ký tự markdown nào trong câu trả lời như *, **, #, \`, -, v.v. Chỉ trả lời bằng văn bản thuần túy, tự nhiên, dễ đọc.`;

// Function to remove markdown formatting from text
const stripMarkdown = (text: string): string => {
    return text
        // Remove bold/italic markers
        .replace(/\*\*\*(.*?)\*\*\*/g, '$1')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/_{3}(.*?)_{3}/g, '$1')
        .replace(/__(.*?)__/g, '$1')
        .replace(/_(.*?)_/g, '$1')
        // Remove headers
        .replace(/^#{1,6}\s+/gm, '')
        // Remove code blocks
        .replace(/```[\s\S]*?```/g, (match) => match.replace(/```\w*\n?/g, '').trim())
        .replace(/`([^`]+)`/g, '$1')
        // Remove bullet points at start of lines
        .replace(/^[\s]*[-*+]\s+/gm, '• ')
        // Remove numbered lists formatting but keep numbers
        .replace(/^[\s]*\d+\.\s+/gm, (match) => match.trim() + ' ')
        // Remove blockquotes
        .replace(/^>\s+/gm, '')
        // Remove horizontal rules
        .replace(/^[-*_]{3,}$/gm, '')
        // Clean up extra whitespace
        .replace(/\n{3,}/g, '\n\n')
        .trim();
};

interface GeminiMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

interface ChatHistory {
    messages: GeminiMessage[];
}

// Store chat history for context
let chatHistory: ChatHistory = {
    messages: []
};

export const resetChatHistory = () => {
    chatHistory = { messages: [] };
};

export const sendMessageToGemini = async (userMessage: string): Promise<string> => {
    try {
        // Add user message to history
        chatHistory.messages.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });

        // Prepare the request body
        const requestBody = {
            contents: [
                {
                    role: 'user',
                    parts: [{ text: SYSTEM_PROMPT }]
                },
                {
                    role: 'model',
                    parts: [{ text: 'Xin chào! Tôi là VIA AI, trợ lý toàn năng của bạn. Tôi sẵn sàng hỗ trợ bạn về mọi lĩnh vực. Hãy hỏi tôi bất cứ điều gì!' }]
                },
                ...chatHistory.messages
            ],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            },
            safetySettings: [
                {
                    category: 'HARM_CATEGORY_HARASSMENT',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                },
                {
                    category: 'HARM_CATEGORY_HATE_SPEECH',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                },
                {
                    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                },
                {
                    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                }
            ]
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Gemini API Error:', errorData);
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        // Extract the response text and clean markdown
        const rawResponse = data.candidates?.[0]?.content?.parts?.[0]?.text ||
            'Xin lỗi, tôi không thể xử lý yêu cầu này. Vui lòng thử lại.';

        const aiResponse = stripMarkdown(rawResponse);

        // Add AI response to history
        chatHistory.messages.push({
            role: 'model',
            parts: [{ text: aiResponse }]
        });

        return aiResponse;
    } catch (error) {
        console.error('Error sending message to Gemini:', error);

        // Remove the failed user message from history
        chatHistory.messages.pop();

        throw new Error('Không thể kết nối đến AI. Vui lòng kiểm tra kết nối mạng và thử lại.');
    }
};

// Simulated streaming - fetches full response then types it out word by word
export const streamMessageToGemini = async (
    userMessage: string,
    onChunk: (text: string) => void
): Promise<string> => {
    try {
        // Add user message to history
        chatHistory.messages.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });

        // Prepare the request body
        const requestBody = {
            contents: [
                {
                    role: 'user',
                    parts: [{ text: SYSTEM_PROMPT }]
                },
                {
                    role: 'model',
                    parts: [{ text: 'Xin chào! Tôi là VIA AI, trợ lý toàn năng của bạn. Tôi sẵn sàng hỗ trợ bạn về mọi lĩnh vực. Hãy hỏi tôi bất cứ điều gì!' }]
                },
                ...chatHistory.messages
            ],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            },
            safetySettings: [
                {
                    category: 'HARM_CATEGORY_HARASSMENT',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                },
                {
                    category: 'HARM_CATEGORY_HATE_SPEECH',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                },
                {
                    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                },
                {
                    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                }
            ]
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Gemini API Error:', errorData);
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        // Extract the response text and clean markdown
        const rawResponse = data.candidates?.[0]?.content?.parts?.[0]?.text ||
            'Xin lỗi, tôi không thể xử lý yêu cầu này. Vui lòng thử lại.';

        const aiResponse = stripMarkdown(rawResponse);

        // Simulate typing effect - display word by word
        const words = aiResponse.split(' ');
        let displayedText = '';

        for (let i = 0; i < words.length; i++) {
            displayedText += (i === 0 ? '' : ' ') + words[i];
            onChunk(displayedText);
            // Small delay between words for typing effect
            await new Promise(resolve => setTimeout(resolve, 30));
        }

        // Add AI response to history
        chatHistory.messages.push({
            role: 'model',
            parts: [{ text: aiResponse }]
        });

        return aiResponse;
    } catch (error) {
        console.error('Error sending message to Gemini:', error);

        // Remove the failed user message from history
        chatHistory.messages.pop();

        throw new Error('Không thể kết nối đến AI. Vui lòng kiểm tra kết nối mạng và thử lại.');
    }
};

export default {
    sendMessageToGemini,
    streamMessageToGemini,
    resetChatHistory
};
