const API_URL = import.meta.env.VITE_API_URL || '';

export async function login(email: string, password: string) {
    const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });
    if (!response.ok) {
        throw new Error('Login failed');
    }
    return response.json();
}

export async function register(username: string, email: string, password: string) {
    const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
    });
    if (!response.ok) {
        throw new Error('Registration failed');
    }
    return response.json();
}

//only send back user ,since rest already with the user
export async function me() {
    const response = await fetch(`${API_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    if (!response.ok) {
        throw new Error('Failed to fetch user information');
    }
    return response.json();
}