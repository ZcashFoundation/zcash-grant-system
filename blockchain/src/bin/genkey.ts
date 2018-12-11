import { generateApiKey } from "../util";

const result = generateApiKey();

console.log("\nCopy both to your .env, and API_SECRET_KEY to your client environment.\n");
console.log(` API_SECRET_KEY=${result.key}`);
console.log(` API_SECRET_HASH=${result.hash}\n`);
