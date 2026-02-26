import nextConfig from "eslint-config-next"
import eslintConfigPrettier from "eslint-config-prettier"

const eslintConfig = [
    ...nextConfig,
    eslintConfigPrettier,
    {
        rules: {
            "@next/next/no-html-link-for-pages": "off",
            "react/jsx-key": "off",
            "react/display-name": "off",
        },
    },
    {
        ignores: [
            ".contentlayer/**",
            ".next/**",
            "node_modules/**",
            "content/**",
        ],
    },
]

export default eslintConfig
