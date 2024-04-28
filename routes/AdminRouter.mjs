import express from "express";
import {
  login,
  register,
  getAllAdmins,
  getAdminById,
  deleteAdmin,
  updateAdmin,
  resetPassword,
  resetverif,
} from "../controllers/AdminController.mjs";
import validationToken from "../middleware/ValidateToken.mjs";
// Admin login
const router = express.Router();

router.route("/").get(getAllAdmins);

router.post("/login", login);
router.post("/resetverif", resetverif);
router.post("/resetPassword", resetPassword);
router.post("/register", register);

router.route("/:id").get(getAdminById).delete(validationToken, deleteAdmin);

router.put("/", validationToken, updateAdmin);

export default router;
