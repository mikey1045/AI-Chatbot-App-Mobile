import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message } from '../components/ChatBubble';
import {
    syncSessionToCloud,
    deleteSessionFromCloud,
    downloadAllSessionsFromCloud,
    hasCloudData
} from './chatService';

export interface ChatSession {
    id: string;
    title: string;
    lastModified: number;
    preview: string;
}

// Current user ID - set this when user logs in
let currentUserId: string | null = null;

/**
 * Set the current user ID - call this when user logs in
 */
export const setCurrentUserId = (userId: string | null) => {
    currentUserId = userId;
    console.log('ChatStorage: User ID set to', userId);
};

/**
 * Get the current user ID
 */
export const getCurrentUserId = (): string | null => currentUserId;

// Storage keys với user ID
const getSessionsKey = () => {
    if (!currentUserId) return 'chat_sessions_index_guest';
    return `chat_sessions_index_${currentUserId}`;
};

const getSessionKey = (id: string) => {
    if (!currentUserId) return `chat_session_guest_${id}`;
    return `chat_session_${currentUserId}_${id}`;
};

export const LEGACY_STORAGE_KEY = 'chat_history_v1';

// Get list of all sessions metadata
export const getSessions = async (): Promise<ChatSession[]> => {
    try {
        const json = await AsyncStorage.getItem(getSessionsKey());
        return json ? JSON.parse(json) : [];
    } catch (e) {
        console.error('Failed to get sessions', e);
        return [];
    }
};

// Get messages for a specific session
export const getSessionMessages = async (sessionId: string): Promise<Message[]> => {
    try {
        const json = await AsyncStorage.getItem(getSessionKey(sessionId));
        if (json) {
            const parsed = JSON.parse(json);
            return parsed.map((m: any) => ({
                ...m,
                timestamp: new Date(m.timestamp)
            }));
        }
        return [];
    } catch (e) {
        console.error('Failed to get session messages', e);
        return [];
    }
};

// Create a new session
export const createSession = async (title: string = 'Cuộc trò chuyện mới'): Promise<string> => {
    const newId = Date.now().toString();
    const newSession: ChatSession = {
        id: newId,
        title,
        lastModified: Date.now(),
        preview: ''
    };

    try {
        const sessions = await getSessions();
        const updatedSessions = [newSession, ...sessions];
        await AsyncStorage.setItem(getSessionsKey(), JSON.stringify(updatedSessions));
        return newId;
    } catch (e) {
        console.error('Failed to create session', e);
        throw e;
    }
};

// Save messages to a session (and update metadata)
export const saveSession = async (sessionId: string, messages: Message[], customTitle?: string) => {
    try {
        // 1. Save messages
        await AsyncStorage.setItem(getSessionKey(sessionId), JSON.stringify(messages));

        // 2. Update metadata (title/date/preview)
        const sessions = await getSessions();
        const sessionIndex = sessions.findIndex(s => s.id === sessionId);

        // Generate preview from last message
        const lastMsg = messages.length > 0 ? messages[messages.length - 1].text : '';
        const preview = lastMsg.length > 50 ? lastMsg.substring(0, 50) + '...' : lastMsg;

        // Auto-generate title from first user message
        let title = customTitle;
        if (!title && messages.length > 0 && sessionIndex !== -1) {
            const currentTitle = sessions[sessionIndex].title;
            // Update title if it's currently a default title OR if it's the very first message being saved
            const isDefaultTitle = currentTitle === 'Cuộc trò chuyện mới' ||
                currentTitle === 'Cuộc trò chuyện' ||
                currentTitle === 'Previous Chat' ||
                currentTitle.startsWith('New Chat');

            if (isDefaultTitle) {
                const firstUserMsg = messages.find(m => m.isUser)?.text;
                if (firstUserMsg) {
                    // Clean up the message (remove newlines, extra spaces)
                    const cleanMsg = firstUserMsg.replace(/\s+/g, ' ').trim();
                    title = cleanMsg.length > 30 ? cleanMsg.substring(0, 30) + '...' : cleanMsg;
                }
            }
        }

        if (sessionIndex !== -1) {
            sessions[sessionIndex] = {
                ...sessions[sessionIndex],
                lastModified: Date.now(),
                preview,
                title: title || sessions[sessionIndex].title
            };

            // Move to top
            const updated = sessions[sessionIndex];
            sessions.splice(sessionIndex, 1);
            sessions.unshift(updated);
        } else {
            // Session not found in index (shouldn't happen usually, but handle it)
            sessions.unshift({
                id: sessionId,
                title: title || 'Cuộc trò chuyện mới',
                lastModified: Date.now(),
                preview
            });
        }

        await AsyncStorage.setItem(getSessionsKey(), JSON.stringify(sessions));

        // Background cloud sync (fire and forget)
        if (currentUserId) {
            const sessionToSync = sessions.find(s => s.id === sessionId);
            if (sessionToSync) {
                syncSessionToCloud(currentUserId, sessionId, sessionToSync, messages).catch(() => { });
            }
        }
    } catch (e) {
        console.error('Failed to save session', e);
    }
};

// Delete a session
export const deleteSession = async (sessionId: string) => {
    try {
        await AsyncStorage.removeItem(getSessionKey(sessionId));
        const sessions = await getSessions();
        const filtered = sessions.filter(s => s.id !== sessionId);
        await AsyncStorage.setItem(getSessionsKey(), JSON.stringify(filtered));

        // Background cloud sync (fire and forget)
        if (currentUserId) {
            deleteSessionFromCloud(currentUserId, sessionId).catch(() => { });
        }
    } catch (e) {
        console.error('Failed to delete session', e);
    }
};

// Migrate legacy single-session data (for current user)
export const migrateLegacyData = async (): Promise<boolean> => {
    try {
        const legacyData = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
        if (legacyData) {
            console.log('Migrating legacy data...');
            const messages = JSON.parse(legacyData);
            if (messages.length > 0) {
                const newId = await createSession('Previous Chat');
                await saveSession(newId, messages);
            }
            await AsyncStorage.removeItem(LEGACY_STORAGE_KEY);
            return true;
        }
        return false;
    } catch (e) {
        console.error('Migration failed', e);
        return false;
    }
};

/**
 * Restore chat data from cloud if local storage is empty.
 * Call this on app startup after user login.
 * Returns true if data was restored from cloud.
 */
export const restoreFromCloudIfNeeded = async (): Promise<boolean> => {
    if (!currentUserId) {
        console.log('[CloudSync] No user ID, skipping cloud restore');
        return false;
    }

    try {
        // Check if local has any sessions
        const localSessions = await getSessions();

        if (localSessions.length > 0) {
            console.log('[CloudSync] Local data exists, skipping cloud restore');
            return false;
        }

        // Check if cloud has data
        const cloudHasData = await hasCloudData(currentUserId);
        if (!cloudHasData) {
            console.log('[CloudSync] No cloud data to restore');
            return false;
        }

        // Download from cloud
        console.log('[CloudSync] Restoring data from cloud...');
        const { sessions, messagesMap } = await downloadAllSessionsFromCloud(currentUserId);

        if (sessions.length === 0) {
            return false;
        }

        // Save to local storage
        await AsyncStorage.setItem(getSessionsKey(), JSON.stringify(sessions));

        for (const session of sessions) {
            const messages = messagesMap[session.id] || [];
            await AsyncStorage.setItem(getSessionKey(session.id), JSON.stringify(messages));
        }

        console.log(`[CloudSync] Restored ${sessions.length} sessions from cloud`);
        return true;
    } catch (e) {
        console.error('[CloudSync] Error restoring from cloud:', e);
        return false;
    }
};
