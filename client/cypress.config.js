import { defineConfig } from "cypress";
import dotenv from "dotenv";
dotenv.config();

export default defineConfig({
  projectId: "pzffma",
  e2e: {
    baseUrl: "http://localhost:5173",
    excludeSpecPattern: [
      "**/examples/*",
      "**/1-getting-started/*",
      "**/2-advanced-examples/*",
      "**/test-to-ignore.spec.js",
      "**/*.md",
    ],
    viewportHeight: 1920,
    viewportHeight: 1080,
    env: {
      VITE_APP_EMAIL: process.env.VITE_APP_EMAIL,
      VITE_APP_PASSWORD: process.env.VITE_APP_PASSWORD,
    },
  },
});
