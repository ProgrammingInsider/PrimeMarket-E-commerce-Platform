import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "__test__/setup.js",
    coverage: {
      provider: "v8",
      // reporter: ['text', 'json', 'html'],
    },
    // reporters: ['junit', 'json', 'verbose'],
    // outputFile: {
    //   junit: './junit-report.xml',
    //   json: './json-report.json',
    // },
    testTimeout: 10000,
  },
});
