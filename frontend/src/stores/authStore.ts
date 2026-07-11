import {create} from 'zustand';
import { register  ,login, me} from '../api/auth';

interface AuthState {

    user : any | null;

    token : string | null;

    loading : boolean;

    isAuthenticated : boolean;

    login : (email: string, password: string) => Promise<boolean>;

    register : (username: string, email: string, password: string) => Promise<boolean>;
    
    logout : () => void;

    checkAuth : () => Promise<void>;

}


export const useAuthStore = create<AuthState>((set) => ({
        
    user: null,

    token: localStorage.getItem('token'),

    loading: !!localStorage.getItem('token'),

    isAuthenticated: false,


    login : async (email: string, password: string) => {
        set({ loading: true });
        try {
            const response = await login(email, password);
            set({ user: response.user, token: response.token, isAuthenticated: true });
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            set({ user: null, token: null, isAuthenticated: false });
            return false;
        }
        finally {
            set({ loading: false });
        }
        
    },

    register : async (username: string, email: string, password: string) => {
        set({ loading: true });
        try {
            const response = await register(username, email, password);
            set({ user: response.user, token: response.token, isAuthenticated: true });

            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            return true;
        } catch (error) {
            console.error('Registration failed:', error);
            set({ user: null, token: null, isAuthenticated: false });
            return false;
        } finally {
            set({ loading: false });
        }
    },

    logout : () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false });
        
    },

    checkAuth : async () => {
        set({ loading: true });
        try {
            if (!localStorage.getItem('token')) {
                set({ user: null, token: null, isAuthenticated: false });
                return;
            }

            const user= await me();
            set({ user: user, token: localStorage.getItem('token'), isAuthenticated: true });
            
        } catch (error) {
            console.error('Failed to fetch user information:', error);
            set({ user: null, token: null, isAuthenticated: false });
        } finally {
            set({ loading: false });
        }
    }

}));