import { constants } from "../constants.mjs";
const errorHandler=(err ,req ,res,next )=>{
const statusCode =res.statusCode ? res.statusCode : 500;
switch (statusCode){
    case constants.VALIDATION_ERROR:
        res.json({
            title :"validation Failed",message :err.message
        })
    case constants.FORBIDDEN:
        res.json({
            title :"FORBIDDEN",message :err.message
        })
    case constants.NOT_FOUND:
        res.json({
            title :"NOT_FOUND",message :err.message
        })
    case constants.SERVER_ERROR:
        res.json({
            title :" SERVER_ERROR",message :err.message
        })
    case constants.UNAUTHORIZED:
        res.json({
            title :"UNAUTHORIZED ",message :err.message
        })
        default:
            console.log("succes");
            break;
    }




};
export default errorHandler