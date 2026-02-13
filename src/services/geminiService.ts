const GEMINI_API_KEY = 'AIzaSyBudf3Y9s384hU2Kbg8zaJ2ooG8Hn0FGa0';

export const GEMINI_MODELS = [
    { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', isNew: false },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', isNew: true },
    { id: 'gemini-3-flash', name: 'Gemini 3 Flash', isNew: true },
    { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro Preview', isNew: true },
    { id: 'gemini-3-deep-think', name: 'Gemini 3 Deep Think', isNew: true },
];

const getApiUrl = (modelId: string) =>
    `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${GEMINI_API_KEY}`;

// System prompt for the AI
// System prompt for the AI
const getSystemPrompt = (userName?: string) => `Bạn là VIA AI - một trợ lý AI toàn năng, thông minh và thân thiện. 
${userName ? `Bạn đang trò chuyện với người dùng tên là "${userName}". Hãy xưng hô thân mật và sử dụng tên "${userName}" khi phù hợp để tạo cảm giác gần gũi.` : ''}

Bạn có kiến thức sâu rộng về mọi lĩnh vực bao gồm:
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

// Interface for UI messages (simplified from ChatBubble)
interface UIMessage {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date | string;
}

interface GeminiMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

// Convert UI history to Gemini API format
const formatHistoryForGemini = (history: UIMessage[]): GeminiMessage[] => {
    return history.map(msg => ({
        role: msg.isUser ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));
};

export const sendMessageToGemini = async (
    userMessage: string,
    history: UIMessage[] = [],
    modelId: string = 'gemini-2.5-flash-lite',
    userName?: string,
    enableSearch: boolean = false
): Promise<string> => {
    try {
        const conversationHistory = formatHistoryForGemini(history);

        // Add the current user message
        conversationHistory.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });

        // Prepare the request body
        const requestBody: any = {
            contents: [
                {
                    role: 'user',
                    parts: [{ text: getSystemPrompt(userName) }]
                },
                {
                    role: 'model',
                    parts: [{ text: `Xin chào${userName ? ' ' + userName : ''}! Tôi là VIA AI, trợ lý toàn năng của bạn. Tôi sẵn sàng hỗ trợ bạn về mọi lĩnh vực. Hãy hỏi tôi bất cứ điều gì!` }]
                },
                ...conversationHistory
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

        // Add Google Search tool if enabled
        if (enableSearch) {
            requestBody.tools = [{ googleSearch: {} }];
        }

        const response = await fetch(getApiUrl(modelId), {
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
        let rawResponse = data.candidates?.[0]?.content?.parts?.[0]?.text ||
            'Xin lỗi, tôi không thể xử lý yêu cầu này. Vui lòng thử lại.';

        // Handle Grounding Metadata (Sources)
        const groundingMetadata = data.candidates?.[0]?.groundingMetadata;
        if (groundingMetadata && groundingMetadata.groundingChunks) {
            const tempDiv = '___________________________\n';
            let sourcesText = `\n\n${tempDiv}**Nguồn tham khảo:**\n`;

            groundingMetadata.groundingChunks.forEach((chunk: any, index: number) => {
                if (chunk.web?.title && chunk.web?.uri) {
                    sourcesText += `${index + 1}. [${chunk.web.title}](${chunk.web.uri})\n`;
                }
            });

            // Only add sources if we found any valid web chunks
            if (sourcesText.includes('http')) {
                rawResponse += sourcesText;
            }
        }

        return stripMarkdown(rawResponse);
    } catch (error) {
        console.error('Error sending message to Gemini:', error);
        throw new Error('Không thể kết nối đến AI. Vui lòng kiểm tra kết nối mạng và thử lại.');
    }
};

// Simulated streaming - fetches full response then types it out word by word
export const streamMessageToGemini = async (
    userMessage: string,
    history: UIMessage[],
    onChunk: (text: string) => void,
    modelId: string = 'gemini-2.5-flash-lite',
    userName?: string,
    enableSearch: boolean = false
): Promise<string> => {
    try {
        const conversationHistory = formatHistoryForGemini(history);

        // DEBUG: Log history to see if context is being passed
        console.log('[Gemini] History length:', history.length);
        console.log('[Gemini] History:', JSON.stringify(history.map(m => ({ role: m.isUser ? 'user' : 'model', text: m.text.substring(0, 50) }))));

        // Add the current user message
        conversationHistory.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });

        // Prepare the request body
        const requestBody: any = {
            contents: [
                {
                    role: 'user',
                    parts: [{ text: getSystemPrompt(userName) }]
                },
                {
                    role: 'model',
                    parts: [{ text: `Xin chào${userName ? ' ' + userName : ''}! Tôi là VIA AI, trợ lý toàn năng của bạn. Tôi sẵn sàng hỗ trợ bạn về mọi lĩnh vực. Hãy hỏi tôi bất cứ điều gì!` }]
                },
                ...conversationHistory
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

        // Add Google Search tool if enabled
        if (enableSearch) {
            requestBody.tools = [{ googleSearch: {} }];
        }

        const response = await fetch(getApiUrl(modelId), {
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
        let rawResponse = data.candidates?.[0]?.content?.parts?.[0]?.text ||
            'Xin lỗi, tôi không thể xử lý yêu cầu này. Vui lòng thử lại.';

        // Handle Grounding Metadata (Sources)
        const groundingMetadata = data.candidates?.[0]?.groundingMetadata;
        let sourcesText = '';
        if (groundingMetadata && groundingMetadata.groundingChunks) {
            const tempDiv = '___________________________\n';
            sourcesText = `\n\n${tempDiv}**Nguồn tham khảo:**\n`;

            groundingMetadata.groundingChunks.forEach((chunk: any, index: number) => {
                if (chunk.web?.title && chunk.web?.uri) {
                    sourcesText += `${index + 1}. [${chunk.web.title}](${chunk.web.uri})\n`;
                }
            });

            // Allow sources to remain if there are valid links
            if (!sourcesText.includes('http')) {
                sourcesText = '';
            }
        }

        const aiResponse = stripMarkdown(rawResponse) + sourcesText;

        // Simulate typing effect - display word by word
        // Note: We type out the main response, then append sources at the end instantly? 
        // Or type it all. Let's type it all but maybe faster or just normal.
        const words = aiResponse.split(' ');
        let displayedText = '';

        for (let i = 0; i < words.length; i++) {
            displayedText += (i === 0 ? '' : ' ') + words[i];
            onChunk(displayedText);
            // Small delay between words for typing effect
            await new Promise(resolve => setTimeout(resolve, 30));
        }

        return aiResponse;
    } catch (error) {
        console.error('Error sending message to Gemini:', error);
        throw new Error('Không thể kết nối đến AI. Vui lòng kiểm tra kết nối mạng và thử lại.');
    }
};

export default {
    sendMessageToGemini,
    streamMessageToGemini,
    GEMINI_MODELS
};
