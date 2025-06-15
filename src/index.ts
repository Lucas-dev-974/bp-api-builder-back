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
import { swaggerOptions } from "./swagger";

const app = express();
export const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Setup Swagger
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Initialize TypeORM
AppDataSource.initialize()
  .then(async () => {
    console.log("Database connection established");



    // Setup API Routes
    app.use("/api", dynamicEntityRoutes);

    app.use("/api", routeRoutes);
    app.use("/api", middlewareRoutes);
    app.use("/api", controllerRoutes);

    // Load dynamic routes from database
    // await RouteLoader.loadRoutes(app);

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((error) => console.log("TypeORM connection error: ", error));