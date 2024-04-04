import express  from "express";
import  {getMusic,updateMusic,getMusicone,deleteMusic,createNewMusic} from "../controllers/musicController.mjs";
const router =express.Router();
router.route('/').get(getMusic)
router.route('/music').post( createNewMusic)
router.route('/:id').get( getMusicone)
router.route('/music:id').put( updateMusic)
router.route('/music:id').delete(deleteMusic)
export default router;