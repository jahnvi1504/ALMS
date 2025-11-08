import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, LoginCredentials, RegisterData, AuthState } from '../../types';
import { loginUser, registerUser, getCurrentUser } from '../../services/api';

// Get token and user data from sessionStorage
const token = sessionStorage.getItem('token');
const storedUser = sessionStorage.getItem('user');

const initialState: AuthState = {
    user: storedUser ? JSON.parse(storedUser) : null,
    isAuthenticated: !!token,
    loading: false,
    error: null,
    token: token,
};

// Initialization logic remains the same...

export const login = createAsyncThunk(
    'auth/login',
    async (credentials: LoginCredentials, { rejectWithValue }) => {
        try {
            const data = await loginUser(credentials);
            // REMOVED: sessionStorage.setItem('token', data.token);
            // REMOVED: sessionStorage.setItem('user', JSON.stringify(data.user));
            return data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Login failed');
        }
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async (userData: RegisterData, { rejectWithValue }) => {
        try {
            const data = await registerUser(userData);
            // REMOVED: sessionStorage.setItem('token', data.token);
            // REMOVED: sessionStorage.setItem('user', JSON.stringify(data.user));
            return data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Registration failed');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
        },
        clearError: (state) => {
            state.error = null;
        },
        updateUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            sessionStorage.setItem('user', JSON.stringify(action.payload));
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
                // ✅ FIX: Move the sessionStorage calls here, to ensure they run with state updates
                sessionStorage.setItem('token', action.payload.token);
                sessionStorage.setItem('user', JSON.stringify(action.payload.user));
                state.error = null;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.isAuthenticated = false;
                state.token = null;
                state.user = null;
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('user');
            })
            // Register
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
                // ✅ FIX: Apply the same logic here
                sessionStorage.setItem('token', action.payload.token);
                sessionStorage.setItem('user', JSON.stringify(action.payload.user));
                state.error = null;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.isAuthenticated = false;
                state.token = null;
                state.user = null;
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('user');
            });
    },
});

export const { logout, clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;