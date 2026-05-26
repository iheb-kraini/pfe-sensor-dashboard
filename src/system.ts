import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: { value: "'Inter Variable', system-ui, sans-serif" },
        body: { value: "'Inter Variable', system-ui, sans-serif" },
      },
    },
  },
  globalCss: {
    html: { scrollBehavior: "smooth" },
    body: { margin: 0 },
    "#root": { minHeight: "100vh" },
  },
});

export const system = createSystem(defaultConfig, config);
