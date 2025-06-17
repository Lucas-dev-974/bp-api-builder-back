import "reflect-metadata";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import { AppDataSource } from "./config/typeorm.config";
import { RouteLoader } from "./utils/routeLoader";
import dynamicEntityRoutes from "./routes/dynamicEntity.routes";
import routeRoutes from "./routes/route.routes";
import middlewareRoutes from "./routes/middleware.routes";
import controllerRoutes from "./routes/controller.routes";
import databaseRoutes from "./routes/database.routes";
import superUserRoutes from "./routes/superUser.routes";
import { checkSuperUserExists } from "./middlewares/checkSuperUser.middleware";
import { authenticate } from "./middlewares/auth.middleware";
import { swaggerOptions } from "./swagger";

const app = express();
export const PORT = process.env.PORT || 3100;

// Middleware
app.use(cors());
app.use(express.json());

// Setup Swagger
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Setup API Routes
app.use("/api/database", databaseRoutes);
app.use("/api/super-users", superUserRoutes);

// Check database credentials
if (!process.env.DB_USERNAME || !process.env.DB_PASSWORD || !process.env.DB_DATABASE) {
  console.warn("Database credentials not configured!");
  console.log("Please configure database credentials using POST /api/database/credentials");
  // Start server
  app.listen(PORT, () => {
    console.log(`Server is running on  localhost::${PORT}`);
    console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
  });
} else {
  // Initialize TypeORM only if credentials are present
  AppDataSource.initialize()
    .then(async () => {
      console.log("Database connection established");

      // Check if super user exists before proceeding with other routes
      app.use(checkSuperUserExists);

      // Apply authentication middleware
      app.use(authenticate);

      app.use("/api", dynamicEntityRoutes);
      app.use("/api", routeRoutes);
      app.use("/api", middlewareRoutes);
      app.use("/api", controllerRoutes);

      // Load dynamic routes from database
      // await RouteLoader.loadRoutes(app);
      // Start server
      app.listen(PORT, () => {
        console.log(`Server is running on  localhost::${PORT}`);
        console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
      });
    })
    .catch((error) => {
      console.error("TypeORM connection error: ", error);
    });
}

