import "reflect-metadata";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import path from "path";

import { AppDataSource } from "./config/typeorm.config";
import databaseRoutes from "./routes/database.routes";
import { checkSuperUserExists } from "./middlewares/checkSuperUser.middleware";
import { authenticate } from "./middlewares/auth.middleware";
import { swaggerOptions } from "./swagger";
import { entitiesManager } from "./utils/EntityClassManager";
import { routeManager } from "./utils/RouteManager";

const app = express();
export const PORT = process.env.PORT || 3100;

// --- Global middlewares ---
app.use(cors());
app.use(express.json());

// --- Swagger setup ---
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

function startServer() {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📚 Swagger documentation: http://localhost:${PORT}/api-docs`);
  });
}

function startWithCredentialPrompt() {
  app.use("/api/database", databaseRoutes);
  startServer();
  console.log("⚠️  Please configure database credentials using POST /api/database/credentials");
}

async function startWithDatabase() {
  try {
    await AppDataSource.initialize();
    console.log("✅ Database connection established");

    routeManager.setExpressApp(app);
    await entitiesManager.buildEntities();

    // Security middlewares
    app.use(checkSuperUserExists);
    app.use(authenticate);

    // Dynamic route loading
    const routesPath = path.join(__dirname, "routes");
    routeManager.loadRoutesFromDirectory(routesPath);

    startServer();
  } catch (error) {
    console.error("❌ TypeORM connection error:", error);
  }
}

// --- Startup logic ---
if (!process.env.DB_USERNAME || !process.env.DB_PASSWORD || !process.env.DB_DATABASE) {
  startWithCredentialPrompt();
} else {
  startWithDatabase();
}
