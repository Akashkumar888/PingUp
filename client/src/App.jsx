import React, { useRef } from 'react'
import { Routes,Route, useLocation } from 'react-router-dom'
import Login from "./pages/Login"
import ChatBox from "./pages/ChatBox"
import Profile from './pages/Profile'
import Connections from './pages/Connections'
import Discovers from './pages/Discovers'
import Feed from './pages/Feed'
import Layout from './pages/Layout'
import Message from './pages/Message'
import CreatePost from './pages/Createpost'
import {useUser,useAuth} from '@clerk/clerk-react'
import toast, {Toaster} from 'react-hot-toast';
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { fetchUser } from './features/user/userSlice'
import { fetchConnections } from './features/connections/connectionSlice'
import { addMessage } from './features/messages/messageSlice'
import Notifications from './components/Notifications'

const App = () => {
  const {user}=useUser();
  const {getToken}=useAuth();
  const {pathname}=useLocation();

  const pathnameRef=useRef(pathname);


  const dispatch=useDispatch();

  useEffect(()=>{
    const fetchData=async()=>{
      if(user){
       const token=await getToken();
       dispatch(fetchUser(token));
       dispatch(fetchConnections(token));
      }
    }
    fetchData();
  },[user,getToken,dispatch]);

  useEffect(()=>{
    pathnameRef.current=pathname;
  },[pathname])
  
  useEffect(()=>{
  if(user){
    const eventSource=new EventSource(import.meta.env.VITE_BASEURL+"/api/message/"+user.id);
    eventSource.onmessage=(event)=>{
     const message=JSON.parse(event.data);
     if(pathnameRef.current===("/messages/"+message.from_user_id._id)){
      dispatch(addMessage(message))
     }
     else {
      toast.custom((t)=>(
        <Notifications t={t} message={message} />
      ),{position:"bottom-right"})
     }
    }
    return ()=>{
      eventSource.close();
    }
  }
  },[user,dispatch])

  return (
    <>
    <Toaster />  {/* Always on top, one instance only */}
      <Routes>
        <Route path='/' element={   !user? <Login/> :<Layout/> }>

                <Route index element={<Feed/>}/>
                <Route path='messages' element={<Message/>}/>
                <Route path='messages/:userId' element={<ChatBox/>}/>
                <Route path='connections' element={<Connections/>}/>
                <Route path='discover' element={<Discovers/>}/>
                <Route path='profile' element={<Profile/>}/>
                <Route path='profile/:profileId' element={<Profile/>}/>
                <Route path='create-post' element={<CreatePost/>}/>

          </Route>
      </Routes>
    </>
  )
}

export default App

