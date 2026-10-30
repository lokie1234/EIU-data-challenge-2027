import { fileURLToPath } from "node:url";
const nextConfig = { poweredByHeader: false, devIndicators: false, turbopack: { root: fileURLToPath(new URL(".", import.meta.url)) } };
export default nextConfig;
