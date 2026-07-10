export async function login(username: string, password: string) {
    const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });
    if (!response.ok) {
        throw new Error('Login failed');
    }
    return response.json();
}

export async function register(username: string, email: string, password: string) {
    const response = await fetch('/auth/register', {
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
    const response = await fetch('/auth/me', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) {
        throw new Error('Failed to fetch user information');
    }
    return response.json();
}