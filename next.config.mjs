// GitHub Pages serves this project at https://roudis.github.io/roudomageiremata/,
// so built assets and links need that path prefix. The repository was renamed from
// "roudomageirikes"; the local folder and package name may still use the old name.
// GITHUB_ACTIONS is set to "true" automatically by GitHub-hosted runners, leaving
// local dev and build untouched.
const repoName = "roudomageiremata";
const isGithubPagesBuild = process.env.GITHUB_ACTIONS === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: isGithubPagesBuild ? `/${repoName}` : "",
  assetPrefix: isGithubPagesBuild ? `/${repoName}/` : "",
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: isGithubPagesBuild ? `/${repoName}` : "",
  },
};

export default nextConfig;
