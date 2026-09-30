import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
const productionCSP =
  "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src https://api.pwnedpasswords.com; object-src 'none'; base-uri 'none'; form-action 'none'";
export default defineConfig(({ command, mode }) => ({
  base: mode === "github-pages" ? "/block-the-breached-password/" : "/",
  plugins: [
    react(),
    {
      name: "production-security-policy",
      transformIndexHtml: {
        order: "post",
        handler() {
          return command === "build"
            ? [
                {
                  tag: "meta",
                  attrs: {
                    "http-equiv": "Content-Security-Policy",
                    content: productionCSP,
                  },
                  injectTo: "head-prepend",
                },
              ]
            : [];
        },
      },
    },
  ],
  server: {
    host: "127.0.0.1",
    headers: {
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
    },
  },
  preview: {
    host: "127.0.0.1",
    headers: {
      "Content-Security-Policy": `${productionCSP}; frame-ancestors 'none'`,
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
    },
  },
}));
