import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname } from "node:path";

const files = [".next/types/cache-life.d.ts"];

for (const filePath of files) {
  if (!existsSync(filePath)) {
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, "", "utf8");
  }
}
