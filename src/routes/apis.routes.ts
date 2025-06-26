import { ApisController } from "../controllers/ApisController";
import { Router } from "express";

const router = Router();

router.post("/", ApisController.create);
router.get("/", ApisController.getAll);
router.get("/:name", ApisController.getByName);
router.put("/:id", ApisController.update);
router.delete("/:id", ApisController.delete);

export default router; 