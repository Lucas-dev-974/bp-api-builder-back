import path from "path";
import { PORT } from "./index";

// Swagger configuration
export const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Headless CMS API Builder",
      version: "1.0.0",
      description: "API documentation for Headless CMS API Builder",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Development server"
      },
    ],
    components: {
      schemas: {
        DynamicEntity: {
          type: "object",
          required: ["name", "schema"],
          properties: {
            name: {
              type: "string",
              example: "utilisateur"
            },
            schema: {
              type: "object",
              example: {
                nom: "string",
                prenom: "string",
                email: "string"
              }
            },
            data: {
              type: "object",
              example: {}
            }
          }
        }
      }
    },
    tags: [
      {
        name: "Dynamic Entities",
        description: "API endpoints for managing dynamic entities"
      }
    ]
  },
  apis: [
    path.join(__dirname, "./controllers/*.ts"),
    path.join(__dirname, "./routes/*.ts")
  ],
};