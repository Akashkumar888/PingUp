
import {configureStore} from '@reduxjs/toolkit'

import userReducer from '../features/user/userSlice'
import  connectionsReducer  from '../features/connections/connectionSlice'
import  messagesReducer  from '../features/messages/messageSlice'

 export const store =configureStore({
  reducer:{
    user:userReducer,
    connections:connectionsReducer,
    messages:messagesReducer,
  }
 })

