import React from 'react'
import { Routes,Route } from 'react-router-dom'
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
import {Toaster} from 'react-hot-toast';
import { useEffect } from 'react'


const App = () => {
  const {user}=useUser();
  const {getToken}=useAuth();
  
  useEffect(()=>{
  if(user){
    getToken().then((token)=>console.log(token));
  }
  },[user]);
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
