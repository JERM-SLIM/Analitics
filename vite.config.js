import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    server: {
      port: env.VITE_PORT|| 3001,
   //  allowedHosts: ["slim-company.com.mx"],   
// host: "0.0.0.0"
    },
  };
});


/*import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    server: {
      host: "45.56.74.34",
      port: env.VITE_PORT || 3000,
      allowedHosts: ["slim-company.com.mx"],
   //  allowedHosts: ["slim-company.com.mx"],   
// host: "0.0.0.0"
    },
  };
});
*/