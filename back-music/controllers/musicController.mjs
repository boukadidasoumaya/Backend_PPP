import expressAsyncHandler from 'express-async-handler'
import Music from '../Models/MusicModel.mjs'
const getMusic =expressAsyncHandler( async (req,res) =>{
    const musicList=await Music.find();
    res.status(200).json({message : musicList})
})
const createNewMusic = expressAsyncHandler( async (req,res) =>{
const { name ,singer ,link}=req.body
if (!name || !singer || !link ){
    res.status(400);
    throw new Error("all fields required")

}
const music= await Music.create( {
    name , singer ,link
})
res.status(201).json({message : music})}
)
const getMusicone =expressAsyncHandler( async(req,res) =>{
    const music= await Music.findById(req.params.id);
    if(!music){
        res.status(404);
        throw new Error("contact not found")
    }
res.status(200).json({message : music})
})
const deleteMusic =expressAsyncHandler( async(req,res) =>{
    const music= await Music.findById(req.params.id);
    if(!music){
        res.status(404);
        throw new Error("contact not found")
    }
    await Music.remove();
})
const updateMusic =expressAsyncHandler( async(req,res) =>{
    const music= await Music.findById(req.params.id);
    if(!music){
        res.status(404);
        throw new Error("contact not found")
    }
    const updatedMusic = await Music.findByIdAndUpdate(req.params.id,req.body,
        {new :true})

res.status(200).json({message : music})
})
export  {getMusic,updateMusic,getMusicone,deleteMusic,createNewMusic}