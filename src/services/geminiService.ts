// Load API key from environment variable (Expo public env var)
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

if (!GEMINI_API_KEY) {
    console.warn('[GeminiService] WARNING: EXPO_PUBLIC_GEMINI_API_KEY is not set in .env file');
}

export const GEMINI_MODELS = [
    { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', isNew: false },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', isNew: true },
    { id: 'gemini-3-flash', name: 'Gemini 3 Flash', isNew: true },
    { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro Preview', isNew: true },
    { id: 'gemini-3-deep-think', name: 'Gemini 3 Deep Think', isNew: true },
];

const getApiUrl = (modelId: string) =>
    `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${GEMINI_API_KEY}`;

// System prompt for the AI — now allows markdown since we render it properly
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
Bạn có thể sử dụng Markdown để định dạng câu trả lời (in đậm, in nghiêng, danh sách, code blocks, bảng...) để câu trả lời dễ đọc hơn.`;

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

        // Extract the response text — keep markdown formatting
        let rawResponse = data.candidates?.[0]?.content?.parts?.[0]?.text ||
            'Xin lỗi, tôi không thể xử lý yêu cầu này. Vui lòng thử lại.';

        // Handle Grounding Metadata (Sources)
        const groundingMetadata = data.candidates?.[0]?.groundingMetadata;
        if (groundingMetadata && groundingMetadata.groundingChunks) {
            let sourcesText = `\n\n---\n**Nguồn tham khảo:**\n`;

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

        return rawResponse;
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

        // Extract the response text — keep markdown formatting
        let rawResponse = data.candidates?.[0]?.content?.parts?.[0]?.text ||
            'Xin lỗi, tôi không thể xử lý yêu cầu này. Vui lòng thử lại.';

        // Handle Grounding Metadata (Sources)
        const groundingMetadata = data.candidates?.[0]?.groundingMetadata;
        let sourcesText = '';
        if (groundingMetadata && groundingMetadata.groundingChunks) {
            sourcesText = `\n\n---\n**Nguồn tham khảo:**\n`;

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

        const aiResponse = rawResponse + sourcesText;

        // Simulate typing effect - display word by word
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
