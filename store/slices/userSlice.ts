import { User } from "@/models/index";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/store/index";
import { userService } from "@/services/index";
import { stat } from "fs";

interface UserSltate {
  username: string;
  accessToken: string;
  error?: string;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  user?: User;
};

interface SessionPaload {
  username: string;
  accessToken: string;
  error?: string;
  user?: User;
};

export interface SignInAction {
  username: string;
  password: string;
}

const initialState: UserSltate = {
  username: 'naIsHandsome',
  accessToken: '',
  error: '',
  isAuthenticated: false,
  isAuthenticating: true,
  user: undefined
};

export const signIn = createAsyncThunk(
  'users/signIn',
  async (signInAction: SignInAction) => {
    const res = await userService.login(signInAction);
    return res;
  }
);

export const signOut = createAsyncThunk(
  'users/signOut',
  () => {
    const res = userService.logout();
    return res;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: initialState,
  reducers: {
    resetUsername: (state, action: PayloadAction<SessionPaload>) => {
      state.username = action.payload.username;
      state.accessToken = action.payload.accessToken;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(signIn.fulfilled, (state, action) => {
      state.isAuthenticating = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
    });
    builder.addCase(signIn.rejected, (state, action: any) => {
      state.isAuthenticating = false;
      state.error = 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง';
    });
    builder.addCase(signIn.pending, (state, action: any) => {
      state.isAuthenticating = true;
    });
    builder.addCase(signOut.pending, (state, action: any) => {
      state.isAuthenticating = true;
    });
    builder.addCase(signOut.fulfilled, (state, action: any) => {
      state.isAuthenticated = false;
      state.user = undefined;
      state.isAuthenticating = true;
      state.accessToken = '';
    });
    builder.addCase(signOut.rejected, (state, action: any) => {
      state.isAuthenticating = false;
      state.error = 'Failed to logout';
    });
  },
});

export const { resetUsername } = userSlice.actions;

// export common user selector
export const userSelector = (store: RootState) => store.user;
export const isAuthenticatedSelector = (store: RootState): boolean => store.user.isAuthenticated;

export default userSlice.reducer;
