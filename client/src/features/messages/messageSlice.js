

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";
import toast from "react-hot-toast";

const initialState={
  messages:[],
};



export const fetchMessages=createAsyncThunk("messages/fetchMessages",
  async({token,userId})=>{
    try {
      const {data}=await api.post("/api/message/get",{to_user_id:userId},{
        headers:{
          Authorization:`Bearer ${token}`
        }
      })
      return data.success ? data : null;
    } catch (error) {
      toast.error(error.message);
    }
  }
)

const messageSlice=createSlice({
  name:'messages',
  initialState,
  reducers:{
   setMessages:(state,action)=>{
    state.messages=action.payload
   },
   addMessage:(state,action)=>{
    state.messages=[...state.messages,action.payload]
   },
   resetMessages:(state)=>{
    state.messages=[]
   },
  },
  extraReducers:(builder)=>{
    builder
    .addCase(fetchMessages.fulfilled,(state,action)=>{
      state.messages=action.payload.messages
    })
  }
});

export const {addMessage,setMessages,resetMessages}=messageSlice.actions;

const messagesReducer=messageSlice.reducer
export default messagesReducer;
