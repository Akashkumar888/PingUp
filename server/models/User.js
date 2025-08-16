import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
  _id:{
  type:String,
  required:true,
  },
 full_name:{
  type:String,
  required:true,
 },
 username:{
  type:String,
  unique:true,
 },
 email:{
  type:String,
  unique:true,
 },
 bio:{
  type:String,
  default:"Hey there! I am using Pinup.",
 },
  profile_picture:{
  type:String,
  default:"",
 },
 cover_photo:{
  type:String,
  default:"",
 },
 location:{
  type:String,
  default:"",
 },
 followers:[{
  type:String,
  ref:"User",
 }],
  following:[{
  type:String,
  ref:"User",
 }],
  connections:[{
  type:String,
  ref:"User",
 }],
},{timestamps:true,minimize:false});

// the minimize: false part tells Mongoose:
// “Do not automatically remove empty objects from documents.”
// By default (minimize: true)
// MongoDB will not store the empty object. The location field will simply be omitted in the database.
// Mongoose does this to “minimize” the document and save space.
// With minimize: false
// It will store the empty object exactly as you set it:

const userModel=mongoose.models.User || mongoose.model('User',userSchema);
export default userModel;

// es — that’s normal Mongoose behavior.
// When you do:
// mongoose.model('User', userSchema)
// Mongoose will automatically create a MongoDB collection name by:
// Converting "User" → lowercase
// Pluralizing it
// So the actual collection name becomes:
// users


// If you want the collection name to stay exactly User instead of users, you could explicitly pass it:
// const userModel = mongoose.models.User || mongoose.model('User', userSchema, 'User');

