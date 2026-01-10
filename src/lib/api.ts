import { auth } from './firebase'; // Import Firebase Auth

export const API_BASE_URL = import.meta.env.VITE_API_TARGET || 'http://localhost:8081';

console.log('[Frontend] API Base URL:', API_BASE_URL);

export const getHeaders = async () => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    // REAL FIREBASE TOKEN
    await auth.authStateReady();
    if (auth.currentUser) {
        try {
            const token = await auth.currentUser.getIdToken();
            headers['Authorization'] = `Bearer ${token}`;
            headers['x-user-id'] = auth.currentUser.uid;
        } catch (e) {
            console.warn("Failed to get ID Token", e);
        }
    } else {
        // Fallback or Anonymous?
        // headers['Authorization'] = 'Bearer anonymous';
    }

    // Inject Custom AI Configuration (BYOK)
    const customKey = localStorage.getItem('ai_custom_key');
    const customModel = localStorage.getItem('ai_custom_model');
    if (customKey) {
        headers['x-ai-custom-key'] = customKey;
    }
    if (customModel) {
        headers['x-ai-custom-model'] = customModel;
    }

    return headers;
};

export const api = {
    get: async (url: string) => {
        // console.log(`[API GET] ${url}`);

        // ELECTRON: Intercept /projects
        if (window.electron && url === '/projects') {
            console.log('[API] Routing /projects to Electron IPC');
            // We need the user ID. In the web version, it's in headers.
            // Here we can grab it from Auth or store it.
            // For now, let's assume auth.currentUser is available since we are logged in.
            const userId = auth.currentUser?.uid;
            if (!userId) throw new Error("User not authenticated for IPC");
            return await window.electron.getProjects(userId);
        }

        const response = await fetch(`${API_BASE_URL}${url}`, {
            headers: await getHeaders(),
        });
        if (!response.ok) {
            console.error(`[API Error] GET ${url}: ${response.status} ${response.statusText}`);
            throw new Error(`API Error: ${response.statusText}`);
        }
        return response.json();
    },

    post: async (url: string, body: any, config: any = {}) => {
        // console.log(`[API POST] ${url}`, body);

        // ELECTRON: Intercept POST /projects
        if (window.electron && url === '/projects') {
            console.log('[API] Routing POST /projects to Electron IPC');
            // Body is the project data
            // We need to ensure userId is attached if the service expects it in the args or if the body has it.
            // LocalProjectService.createProject(name, description, userId, id) through IPC
            // The IPC handler expects { name, description, userId, id }
            // We should inject userId from auth
            const userId = auth.currentUser?.uid;
            if (!userId) throw new Error("User not authenticated for IPC");

            const projectData = { ...body, userId };
            return await window.electron.createProject(projectData);
        }

        const headers = await getHeaders();
        const finalHeaders = { ...headers, ...config.headers };

        if (body instanceof FormData) {
            if (finalHeaders['Content-Type']) {
                delete finalHeaders['Content-Type']; // Let browser set boundary
            }
        } else if (finalHeaders['Content-Type'] === 'multipart/form-data') {
            delete finalHeaders['Content-Type'];
        } else {
            body = JSON.stringify(body);
        }

        const response = await fetch(`${API_BASE_URL}${url}`, {
            method: 'POST',
            headers: finalHeaders,
            body: body,
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(`[API Error] POST ${url}:`, errorData);
            throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorData.details || errorData.error || JSON.stringify(errorData)}`);
        }
        return response.json();
    },

    put: async (url: string, body: any) => {
        // console.log(`[API PUT] ${url}`, body);
        const response = await fetch(`${API_BASE_URL}${url}`, {
            method: 'PUT',
            headers: await getHeaders(),
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            console.error(`[API Error] PUT ${url}: ${response.statusText}`);
            throw new Error(`API Error: ${response.statusText}`);
        }
        return response.json();
    },

    patch: async (url: string, body: any) => {
        // console.log(`[API PATCH] ${url}`, body);
        const response = await fetch(`${API_BASE_URL}${url}`, {
            method: 'PATCH',
            headers: await getHeaders(),
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            console.error(`[API Error] PATCH ${url}: ${response.statusText}`);
            throw new Error(`API Error: ${response.statusText}`);
        }
        return response.json();
    },

    delete: async (url: string) => {
        // console.log(`[API DELETE] ${url}`);
        const response = await fetch(`${API_BASE_URL}${url}`, {
            method: 'DELETE',
            headers: await getHeaders(),
        });
        if (!response.ok) {
            console.error(`[API Error] DELETE ${url}: ${response.statusText}`);
            throw new Error(`API Error: ${response.statusText}`);
        }
        return response;
    },

    download: async (url: string) => {
        // console.log(`[API DOWNLOAD] ${url}`);
        const response = await fetch(`${API_BASE_URL}${url}`, {
            headers: await getHeaders(),
        });
        if (!response.ok) {
            console.error(`[API Error] DOWNLOAD ${url}: ${response.statusText}`);
            throw new Error(`API Error: ${response.statusText}`);
        }
        return response.blob();
    }
};
