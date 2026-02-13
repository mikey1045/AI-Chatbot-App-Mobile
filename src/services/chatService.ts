import {
    ref,
    set,
    get,
    push,
    remove,
    query,
    orderByChild,
    child
} from 'firebase/database';
import { database } from '../config/firebaseConfig';
import { Message } from '../components/ChatBubble';

export interface ChatSession {
    id: string;
    title: string;
    lastModified: number;
    preview: string;
}

// ============================================
// HYBRID SYNC FUNCTIONS (Background Sync)
// ============================================

/**
 * Sync a single session (with all messages) to Realtime Database.
 * Used for background sync after local save.
 */
export const syncSessionToCloud = async (
    userId: string,
    sessionId: string,
    sessionData: { title: string; preview: string; lastModified: number },
    messages: Message[]
) => {
    try {
        const sessionRef = ref(database, `users/${userId}/sessions/${sessionId}`);

        // Prepare session data
        const cloudSessionData = {
            title: sessionData.title,
            preview: sessionData.preview,
            lastModified: sessionData.lastModified,
            createdAt: sessionData.lastModified,
        };

        // Save session metadata
        await set(child(sessionRef, 'metadata'), cloudSessionData);

        // Save all messages
        const messagesData: { [key: string]: any } = {};
        messages.forEach((msg, index) => {
            messagesData[msg.id || `msg_${index}`] = {
                text: msg.text,
                isUser: msg.isUser,
                timestamp: msg.timestamp instanceof Date ? msg.timestamp.getTime() : new Date(msg.timestamp).getTime(),
            };
        });

        await set(child(sessionRef, 'messages'), messagesData);

        console.log(`[CloudSync] Session ${sessionId} synced to cloud`);
    } catch (e) {
        console.error('[CloudSync] Error syncing session to cloud:', e);
        // Don't throw - background sync should fail silently
    }
};

/**
 * Delete a session from Realtime Database.
 */
export const deleteSessionFromCloud = async (userId: string, sessionId: string) => {
    try {
        const sessionRef = ref(database, `users/${userId}/sessions/${sessionId}`);
        await remove(sessionRef);
        console.log(`[CloudSync] Session ${sessionId} deleted from cloud`);
    } catch (e) {
        console.error('[CloudSync] Error deleting session from cloud:', e);
    }
};

/**
 * Download all sessions and messages from Realtime Database.
 * Returns data in the format that chatStorage.ts expects.
 */
export const downloadAllSessionsFromCloud = async (userId: string): Promise<{
    sessions: { id: string; title: string; preview: string; lastModified: number }[];
    messagesMap: { [sessionId: string]: Message[] };
}> => {
    try {
        const userSessionsRef = ref(database, `users/${userId}/sessions`);
        const snapshot = await get(userSessionsRef);

        if (!snapshot.exists()) {
            console.log('[CloudSync] No cloud data found');
            return { sessions: [], messagesMap: {} };
        }

        const data = snapshot.val();
        const sessions: { id: string; title: string; preview: string; lastModified: number }[] = [];
        const messagesMap: { [sessionId: string]: Message[] } = {};

        for (const sessionId of Object.keys(data)) {
            const sessionData = data[sessionId];
            const metadata = sessionData.metadata || sessionData;

            sessions.push({
                id: sessionId,
                title: metadata.title || 'Cuộc trò chuyện',
                preview: metadata.preview || '',
                lastModified: metadata.lastModified || Date.now(),
            });

            // Parse messages
            const messagesData = sessionData.messages || {};
            const messages: Message[] = Object.keys(messagesData).map((msgId) => {
                const msg = messagesData[msgId];
                return {
                    id: msgId,
                    text: msg.text,
                    isUser: msg.isUser,
                    timestamp: new Date(msg.timestamp),
                };
            });

            // Sort messages by timestamp
            messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            messagesMap[sessionId] = messages;
        }

        // Sort sessions by lastModified (newest first)
        sessions.sort((a, b) => b.lastModified - a.lastModified);

        console.log(`[CloudSync] Downloaded ${sessions.length} sessions from cloud`);
        return { sessions, messagesMap };
    } catch (e) {
        console.error('[CloudSync] Error downloading from cloud:', e);
        return { sessions: [], messagesMap: {} };
    }
};

/**
 * Check if cloud has any data for this user.
 */
export const hasCloudData = async (userId: string): Promise<boolean> => {
    try {
        const userSessionsRef = ref(database, `users/${userId}/sessions`);
        const snapshot = await get(userSessionsRef);
        return snapshot.exists();
    } catch (e) {
        console.error('[CloudSync] Error checking cloud data:', e);
        return false;
    }
};
