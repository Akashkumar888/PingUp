

import { createSlice } from "@reduxjs/toolkit";

const initialState={
  messages:[],
};

const messageSlice=createSlice({
  name:'messages',
  initialState,
  reducers:{

  }
});

const messagesReducer=messageSlice.reducer
export default messagesReducer;
