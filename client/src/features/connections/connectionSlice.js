

import { createSlice } from "@reduxjs/toolkit";

const initialState={
  connections:[],
  pendingConnections:[],
  followers:[],
  following:[],
};


const connectionsSlice=createSlice({
  name:'connections',
  initialState,
  reducers:{

  }
});

const connectionsReducer=connectionsSlice.reducer
export default connectionsReducer;
