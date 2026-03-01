import { auth } from './firebase';

const getAuthenticatedUser = async () => {
    if (auth.currentUser) return auth.currentUser;
    return new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            unsubscribe();
            resolve(user);
        });
    });
};

export async function apiFetch(url: string, options: RequestInit = {}) {
    const user = await getAuthenticatedUser() as any;

    if (!user) {
        if (typeof window !== 'undefined') {
            alert('Session expired. Please log in again.');
            window.location.href = '/login';
        }
        throw new Error("No authenticated user");
    }

    try {
        // Force refresh token as requested to guarantee freshness
        const token = await user.getIdToken(true);

        const customHeaders = new Headers(options.headers);
        customHeaders.set('Authorization', `Bearer ${token}`);
        if (!customHeaders.has('Content-Type')) {
            customHeaders.set('Content-Type', 'application/json');
        }

        const response = await fetch(url, {
            ...options,
            headers: customHeaders,
        });

        if (response.status === 401) {
            if (typeof window !== 'undefined') {
                alert('Session expired. Please log in again.');
                window.location.href = '/login';
            }
        }

        return response;
    } catch (error) {
        console.error("API Fetch Error:", error);
        throw error;
    }
}
