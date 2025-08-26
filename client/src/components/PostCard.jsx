import { BadgeCheck, Heart, MessageCircle, Share2, Trash2, Send } from 'lucide-react'
import React, { useState } from 'react'
import moment from 'moment'
import {useNavigate} from 'react-router-dom'
import { useSelector } from 'react-redux';
import { useAuth } from '@clerk/clerk-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const PostCard = ({ post }) => {
  const postWithHashtags = post.content.replace(/(#\w+)/g, '<span class="text-indigo-600">$1</span>');

  const currentUser = useSelector((state)=>state.user.value);
  
  const {getToken}=useAuth();
  // Likes state
  const [likes, setLikes] = useState(post.likes_count);

  // Comments state
  const [comments, setComments] = useState(post.comments);

  // Like / Unlike
  const handleLike =async () => {
  try {
    const token=await getToken();
    const {data}=await api.post(`/api/post/like`,{postId:post._id},{
      headers:{
        Authorization:`Bearer ${token}`
      }
    })
    if(data.success){
    toast.success(data.message);
    setLikes(prev=>{
      if(prev.includes(currentUser._id)){
        return prev.filter(id=> id !== currentUser._id);
      }
      else{
        return [...prev,currentUser._id];
      }
    })
    }
    else{
      toast.error(data.message);
    }
  } catch (error) {
    toast.error(error.message);
  }
  };


  const navigate=useNavigate();
  


  return (
    <div className='bg-white rounded-xl shadow p-4 space-y-4 w-full max-w-2xl'>
      {/* user info */}
      <div onClick={()=>navigate('/profile' + post.user._id)} className="inline-flex items-center gap-3 cursor-pointer">
        <img src={post.user.profile_picture} alt="" className='w-10 h-10 rounded-full shadow' />
        <div>
          <div className="flex items-center space-x-1">
            <span>{post.user.full_name}</span>
            <BadgeCheck className='w-4 h-4 text-blue-500' />
          </div>
          <div className="text-gray-500 text-sm">
            @{post.user.username} · {moment(post.createdAt).fromNow()}
          </div>
        </div>
      </div>

      {/* content */}
      {post.content && (
        <div className='text-gray-800 text-sm whitespace-pre-line'
          dangerouslySetInnerHTML={{ __html: postWithHashtags }} />
      )}

      {/* images */}
      <div className="grid grid-cols-2 gap-2">
        {post.image_urls.map((img, index) => (
          <img key={index} src={img} alt="" className={`w-full h-48 object-cover rounded-lg ${post.image_urls.length === 1 && "col-span-2 h-auto"}`} />
        ))}
      </div>


      {/* actions */}
      <div className="flex items-center gap-4 text-gray-600 text-sm pt-2 border-t border-gray-300">
        <div className="flex items-center gap-1">
          <Heart
            className={`w-4 h-4 cursor-pointer ${likes.includes(currentUser._id) && 'text-red-500 fill-red-500'}`}
            onClick={handleLike}
          />
          <span>{likes.length}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle
            className='w-4 h-4 cursor-pointer'
          
          />
          <span>{12}</span>
        </div>
        <div className="flex items-center gap-1">
          <Share2 className='w-4 h-4 cursor-pointer' />
          <span>{7}</span>
        </div>
      </div>
    </div>
  );
};

export default PostCard;





// import { BadgeCheck, Heart, MessageCircle, Share2, Trash2, Send, Edit3 } from 'lucide-react'
// import React, { useState, useEffect } from 'react'
// import moment from 'moment'
// import { useNavigate } from 'react-router-dom'
// import { useSelector } from 'react-redux';
// import { useAuth } from '@clerk/clerk-react';
// import api from '../api/axios';
// import toast from 'react-hot-toast';

// const PostCard = ({ post }) => {
//   const postWithHashtags = post.content.replace(/(#\w+)/g, '<span class="text-indigo-600">$1</span>');
//   const currentUser = useSelector((state) => state.user.value);
//   const { getToken } = useAuth();
//   const navigate = useNavigate();

//   // state
//   const [likes, setLikes] = useState(post.likes_count);
//   const [comments, setComments] = useState([]);
//   const [showComments, setShowComments] = useState(false);
//   const [newComment, setNewComment] = useState("");
//   const [editingComment, setEditingComment] = useState(null);

//   // like / unlike
//   const handleLike = async () => {
//     try {
//       const token = await getToken();
//       const { data } = await api.post(`/api/post/like`, { postId: post._id }, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (data.success) {
//         toast.success(data.message);
//         setLikes(prev => {
//           if (prev.includes(currentUser._id)) {
//             return prev.filter(id => id !== currentUser._id);
//           } else {
//             return [...prev, currentUser._id];
//           }
//         });
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   // fetch comments
//   const fetchComments = async () => {
//     try {
//       const token = await getToken();
//       const { data } = await api.get(`/api/comment/${post._id}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (data.success) {
//         setComments(data.comments);
//       }
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   // toggle comments
//   const toggleComments = () => {
//     setShowComments(!showComments);
//     if (!showComments) fetchComments();
//   };

//   // add or edit comment
//   const handleSubmitComment = async () => {
//     if (!newComment.trim()) return;
//     try {
//       const token = await getToken();
//       if (editingComment) {
//         // edit
//         const { data } = await api.put(`/api/comment/edit`, { commentId: editingComment._id, text: newComment }, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         if (data.success) {
//           setComments(prev => prev.map(c => c._id === editingComment._id ? data.comment : c));
//           toast.success("Comment updated");
//           setEditingComment(null);
//         }
//       } else {
//         // add
//         const { data } = await api.post(`/api/comment/add`, { postId: post._id, text: newComment }, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         if (data.success) {
//           setComments(prev => [data.comment, ...prev]);
//           toast.success("Comment added");
//         }
//       }
//       setNewComment("");
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   // delete comment
//   const handleDeleteComment = async (commentId) => {
//     try {
//       const token = await getToken();
//       const { data } = await api.delete(`/api/comment/delete`, {
//         headers: { Authorization: `Bearer ${token}` },
//         data: { commentId }
//       });
//       if (data.success) {
//         setComments(prev => prev.filter(c => c._id !== commentId));
//         toast.success("Comment deleted");
//       }
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   // share
//   const handleShare = () => {
//     const link = `${window.location.origin}/post/${post._id}`;
//     navigator.clipboard.writeText(link);
//     toast.success("Post link copied!");
//   };

//   return (
//     <div className='bg-white rounded-xl shadow p-4 space-y-4 w-full max-w-2xl'>
//       {/* user info */}
//       <div onClick={() => navigate('/profile/' + post.user._id)} className="inline-flex items-center gap-3 cursor-pointer">
//         <img src={post.user.profile_picture} alt="" className='w-10 h-10 rounded-full shadow' />
//         <div>
//           <div className="flex items-center space-x-1">
//             <span>{post.user.full_name}</span>
//             <BadgeCheck className='w-4 h-4 text-blue-500' />
//           </div>
//           <div className="text-gray-500 text-sm">
//             @{post.user.username} · {moment(post.createdAt).fromNow()}
//           </div>
//         </div>
//       </div>

//       {/* content */}
//       {post.content && (
//         <div className='text-gray-800 text-sm whitespace-pre-line'
//           dangerouslySetInnerHTML={{ __html: postWithHashtags }} />
//       )}

//       {/* images */}
//       {post.image_urls.length > 0 && (
//         <div className="grid grid-cols-2 gap-2">
//           {post.image_urls.map((img, index) => (
//             <img key={index} src={img} alt="" className={`w-full h-48 object-cover rounded-lg ${post.image_urls.length === 1 && "col-span-2 h-auto"}`} />
//           ))}
//         </div>
//       )}

//       {/* actions */}
//       <div className="flex items-center gap-4 text-gray-600 text-sm pt-2 border-t border-gray-300">
//         <div className="flex items-center gap-1">
//           <Heart
//             className={`w-4 h-4 cursor-pointer ${likes.includes(currentUser._id) && 'text-red-500 fill-red-500'}`}
//             onClick={handleLike}
//           />
//           <span>{likes.length}</span>
//         </div>
//         <div className="flex items-center gap-1">
//           <MessageCircle className='w-4 h-4 cursor-pointer' onClick={toggleComments} />
//           <span>{comments.length}</span>
//         </div>
//         <div className="flex items-center gap-1">
//           <Share2 className='w-4 h-4 cursor-pointer' onClick={handleShare} />
//         </div>
//       </div>

//       {/* comments section */}
//       {showComments && (
//         <div className="pt-3 border-t border-gray-200 space-y-3">
//           {/* add comment */}
//           <div className="flex items-center gap-2">
//             <input
//               type="text"
//               placeholder="Add a comment..."
//               value={newComment}
//               onChange={(e) => setNewComment(e.target.value)}
//               className="flex-1 border rounded-md p-2 text-sm"
//             />
//             <Send className="w-5 h-5 cursor-pointer text-blue-500" onClick={handleSubmitComment} />
//           </div>

//           {/* comments list */}
//           {comments.map(c => (
//             <div key={c._id} className="flex items-start gap-2">
//               <img src={c.user.profile_picture} alt="" className="w-8 h-8 rounded-full" />
//               <div className="flex-1">
//                 <div className="text-sm">
//                   <span className="font-semibold">{c.user.username}</span>{" "}
//                   {c.text}
//                 </div>
//                 <div className="text-xs text-gray-500">{moment(c.createdAt).fromNow()}</div>
//               </div>
//               {c.user._id === currentUser._id && (
//                 <div className="flex gap-2">
//                   <Edit3 className="w-4 h-4 text-blue-500 cursor-pointer" onClick={() => { setNewComment(c.text); setEditingComment(c); }} />
//                   <Trash2 className="w-4 h-4 text-red-500 cursor-pointer" onClick={() => handleDeleteComment(c._id)} />
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default PostCard;
