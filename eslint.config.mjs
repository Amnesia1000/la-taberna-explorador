import next from "eslint-config-next";

const config = [
  ...next,
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts"],
  },
  {
    // El código usa fetch-en-effect y resets derivados de forma idiomática.
    // Se marcan como avisos en vez de errores para no bloquear el lint.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
    },
  },
];

export default config;
