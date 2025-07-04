#!/usr/bin/env zx

const VITE_TEMPLATES = {
  // Astro
  "astro-tailwind":
    "npm create astro@latest {key} -- --template with-tailwindcss --typescript strict --install --add react --git",

  // Vite
  //"vite-ts": "npm create vite@latest {key} -- --template react-ts",

  // Next.js
  //nextjs: `npx --yes create-next-app {key} --yes`,
};

const templatesToUpdate = process.argv.slice(3);

for (const [key, value] of Object.entries(VITE_TEMPLATES)) {
  if (templatesToUpdate.length > 0 && !templatesToUpdate.includes(key)) {
    continue;
  }

  const maxSteps = 5;

  if (!fs.existsSync(key)) {
    echo(
      chalk.yellow(`[0/${maxSteps}] ${key}:`),
      chalk.green(`Creating folder`)
    );
    await $`mkdir ${key}`;
  }

  echo(
    chalk.yellow(`[1/${maxSteps}] ${key}:`),
    chalk.green(`Deleting folder content`)
  );
  await $`find ${key} -mindepth 1 -maxdepth 1 ! -wholename '${key}/.devcontainer*' ! -wholename '${key}/.codesandbox*' -exec rm -r {} +`;

  echo(chalk.yellow(`[2/${maxSteps}] ${key}:`), chalk.green(`Running command`));
  const command = value.replace("{key}", key + "/tmp");
  await $([command]);

  echo(chalk.yellow(`[2/${maxSteps}] ${key}:`), chalk.green(`Move files`));
  await $`find ${key}/tmp/ -mindepth 1 -maxdepth 1 -exec mv -t ${key}/ {} +`;
  // await $`mv ${key}/tmp/.gitignore ${key} `;
  await $`rm -rf ${key}/tmp`;

  const isJavaScript = fs.existsSync(`${key}/package.json`);
  if (isJavaScript) {
    echo(
      chalk.yellow(`[3/${maxSteps}] ${key}:`),
      chalk.green(`Installing dependencies`)
    );
    cd(key);
    await $`pnpm i`;

    echo(chalk.yellow(`[4/${maxSteps}] ${key}:`), chalk.green(`Prettier`));
    await $`prettier . --write`;

    echo(
      chalk.yellow(`[5/${maxSteps}] ${key}:`),
      chalk.green(`Rename package.json#name`)
    );
    await $`npm pkg set 'name'=${key}`;
  }

  const isRust = fs.existsSync(`${key}/Cargo.toml`);
  if (isRust) {
    cd(key);
    // Replace some local dependencies with crates.io
    if (key === "rust-axum") {
      await $`cargo remove axum`;
      await $`cargo add axum`;
    }
  }

  cd("..");
}
