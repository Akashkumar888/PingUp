
import express from 'express';
import { protect } from '../middlewares/auth.js';
import { addUserStory, getStories } from '../controllers/storyController.js';
import upload from '../configs/multer.js';

const storyRouter=express.Router();
// upload.single('media')
// Used when you want to upload a single file.
// The input field name must be media.
// Works for either 1 image OR 1 video OR 1 PDF (any single file type, depending on your multer config).
// upload.array('images', 4)
// Used when you want to upload multiple files (max 4 files).
// The input field name must be images.  
// upload.single('image')
// This is just like upload.single('media'), but the field name is image instead of media.
// Only 1 file can be uploaded through this field.

storyRouter.post('/create',upload.single('media'), protect,addUserStory);
storyRouter.get('/get',protect,getStories);

export default storyRouter;
