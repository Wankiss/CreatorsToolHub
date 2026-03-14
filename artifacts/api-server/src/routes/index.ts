import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import toolsRouter from "./tools.js";
import categoriesRouter from "./categories.js";
import blogRouter from "./blog.js";
import analyticsRouter from "./analytics.js";
import adminRouter from "./admin.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(toolsRouter);
router.use(categoriesRouter);
router.use(blogRouter);
router.use(analyticsRouter);
router.use(adminRouter);

export default router;
