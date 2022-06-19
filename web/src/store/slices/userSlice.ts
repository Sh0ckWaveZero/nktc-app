import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import * as serviceService from "@/services/server-service";
import {AxiosRequestConfig} from "axios";
import {UserData} from "@/models/user-model";
import Router from "next/router";
import {RootState} from "@/store/store";
import httpClient from "@/utils/http-client";

interface Login {
  username: string;
  password: string;
}

interface SignAction {
  username: string;
  password: string;
}

interface UserState {
  username: string;
  accessToken: string;
  error?: string;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  user?: UserData;
}

const initialState: UserState = {
  username: "",
  accessToken: "",
  isAuthenticated: false,
  isAuthenticating: true,
  user: undefined,
};

interface SingleProp {
  data: string;
}

export const signIn = createAsyncThunk(
  "user/sign-in",
  async (credential: Login) => {
    const response = await serviceService.sigIn(credential);
    console.log("response", response);
    if (!response.success) {
      throw new Error(response.message);
    }

    //  set access token
    httpClient.interceptors.request.use((config?: AxiosRequestConfig) => {
      if (config && config.headers) {
        config.headers['Authorization'] = `Bearer ${response.token}`;
      }

      return config;
    });

    return response;
  }
);

export const signUp = createAsyncThunk(
  "user/login",
  async (credential: SignAction) => {
    const response = await serviceService.signUp(credential);

    return response;
  }
);

export const signOut = createAsyncThunk("user/logout", async () => {
  await serviceService.signOut();
  await Router.push("/pages/login");
});

export const getSession = createAsyncThunk("user/fetchSession", async () => {
  const response = await serviceService.getSession();

  // set access token
  if (response) {
    httpClient.interceptors.request.use((config?: AxiosRequestConfig) => {
      if (config && config.headers && response.user) {
        config.headers["Authorization"] = `Bearer ${response.user?.token}`;
      }

      return config;
    });
  }

  return response;
});

const userSlice = createSlice({
  name: "user",
  initialState: initialState,
  reducers: {
    resetUsername: (state, action: PayloadAction<SingleProp>) => {
      state.username = action.payload.data;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(signUp.fulfilled, (state, action) => {
      state.accessToken = "";
      state.user = undefined;
      state.isAuthenticated = false;
    });
    builder.addCase(signIn.fulfilled, (state, action) => {
      state.accessToken = action.payload.token;
      state.isAuthenticated = true;
      state.isAuthenticating = false;
      state.user = action.payload.user;
    });
    builder.addCase(signIn.rejected, (state, action) => {
      state.accessToken = "";
      state.isAuthenticated = false;
      state.isAuthenticating = false;
      state.user = undefined;
    });
    builder.addCase(signOut.fulfilled, (state, action) => {
      state.accessToken = "";
      state.isAuthenticated = false;
      state.isAuthenticating = false;
      state.user = undefined;
    });
    builder.addCase(getSession.fulfilled, (state, action: any) => {
      state.isAuthenticating = false;
      if (action.payload && action.payload.user && action.payload.user.token) {
        state.accessToken = action.payload.user.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      }
    });
  }
})

export const {resetUsername} = userSlice.actions;

// export common user selector
export const userSelector = (store: RootState) => store.user;
export const isAuthenticatedSelector = (store: RootState): boolean =>
  store.user.isAuthenticated;
export const isAuthenticatingSelector = (store: RootState): boolean =>
  store.user.isAuthenticating;

// // export reducer
export default userSlice.reducer;

