import { User } from "@/models/index";
import { createSlice } from "@reduxjs/toolkit";

interface UserSltate {
  userName: string;
  accessToken: string;
  error?: string;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  user?: User;
};

const initialState: UserSltate = {
  userName: 'naIsHandsome',
  accessToken: '',
  error: '',
  isAuthenticated: false,
  isAuthenticating: true,
  user: undefined
};

const userSlice = createSlice({
  name: 'user',
  initialState: initialState,
  reducers: {},
  extraReducers: (builder: any) => { },
});

export default userSlice.reducer;
