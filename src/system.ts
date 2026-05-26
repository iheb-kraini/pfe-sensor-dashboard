import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: { value: "'Inter Variable', system-ui, sans-serif" },
        body: { value: "'Inter Variable', system-ui, sans-serif" },
      },
      colors: {
        brand: {
          50: { value: "#eff6ff" },
          100: { value: "#dbeafe" },
          200: { value: "#bfdbfe" },
          300: { value: "#93c5fd" },
          400: { value: "#60a5fa" },
          500: { value: "#3b82f6" },
          600: { value: "#2563eb" },
          700: { value: "#1d4ed8" },
        },
        surface: {
          page: { value: "#f8f9fb" },
          card: { value: "#ffffff" },
          sidebar: { value: "#1a1d23" },
          raised: { value: "#ffffff" },
        },
        muted: {
          50: { value: "#f9fafb" },
          100: { value: "#f3f4f6" },
          200: { value: "#e5e7eb" },
          300: { value: "#d1d5db" },
          400: { value: "#9ca3af" },
          500: { value: "#6b7280" },
          600: { value: "#4b5563" },
          700: { value: "#374151" },
          800: { value: "#1f2937" },
          900: { value: "#111827" },
        },
      },
    },
    semanticTokens: {
      colors: {
        bg: { value: "{colors.surface.page}" },
        "bg.card": { value: "{colors.surface.card}" },
        "bg.sidebar": { value: "{colors.surface.sidebar}" },
        "fg.default": { value: "{colors.muted.900}" },
        "fg.muted": { value: "{colors.muted.500}" },
        "fg.subtle": { value: "{colors.muted.400}" },
        "border.default": { value: "{colors.muted.200}" },
        accent: { value: "{colors.brand.500}" },
      },
    },
  },
  globalCss: {
    html: { scrollBehavior: "smooth" },
    body: { margin: 0, bg: "bg" },
    "#root": { minHeight: "100vh" },
  },
});

export const system = createSystem(defaultConfig, config);
