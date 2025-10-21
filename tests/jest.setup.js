require("dotenv").config({ path: ".env.test" });
const { execSync } = require("child_process");

beforeAll(() => {
  execSync("npx prisma db push --force-reset --skip-generate", {
    stdio: "inherit",
    // Important: force Prisma to use the test DB from .env.test
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
  });
});
require("dotenv").config({ path: ".env.test", override: true });

