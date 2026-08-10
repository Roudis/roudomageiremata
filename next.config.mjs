// GitHub Pages serves this project at https://<user>.github.io/roudomageirikes/,
// so built assets/links need that path prefix. GITHUB_ACTIONS is set to "true"
// automatically by GitHub-hosted runners, leaving local dev/build untouched.
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
