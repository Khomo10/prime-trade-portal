import { Router, type IRouter } from "express";
import meRouter from "./me";
import dashboardRouter from "./dashboard";
import academyRouter from "./academy";
import leaderboardRouter from "./leaderboard";

const router: IRouter = Router();

router.use(meRouter);
router.use(dashboardRouter);
router.use(academyRouter);
router.use(leaderboardRouter);

export default router;
