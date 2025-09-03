


import multer from "multer";

const storage = multer.memoryStorage(); // store file in RAM temporarily
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

export default upload;










// import multer from 'multer'

// const storage=multer.diskStorage({});

// const upload=multer({storage:storage});

// export default upload;


// import multer from "multer";
// import sharp from "sharp";

// // --- Multer Setup ---
// const storage = multer.memoryStorage();

// const fileFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith("image/")) {
//     cb(null, true); // Accept only images
//   } else {
//     cb(new Error("Only image files are allowed!"), false);
//   }
// };

// const upload = multer({
//   storage,
//   fileFilter,
// });


// // --- Middleware for sharp image processing ---
// const processImage = async (req, res, next) => {
//   if (!req.file) return next();

//   try {
//     // Compress & Convert to webp (best for web)
//     const buffer = await sharp(req.file.buffer)
//       .resize({ width: 800, withoutEnlargement: true }) // Resize max width=800px
//       .toFormat("webp") // Convert to webp for optimization
//       .webp({ quality: 80 }) // Adjust quality (70-85 is good balance)
//       .toBuffer();

//     req.file.buffer = buffer;
//     req.file.mimetype = "image/webp"; 
//     req.file.originalname = req.file.originalname.split(".")[0] + ".webp";

//     next();
//   } catch (error) {
//     next(error);
//   }
// };


// export { upload, processImage };
