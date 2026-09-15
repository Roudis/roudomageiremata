import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const changelogPath = resolve(process.cwd(), "CHANGELOG.md");
const commitUrlBase =
  process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY
    ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/commit`
    : getCommitUrlBase();

const categories = [
  ["feat", "Added"],
  ["fix", "Fixed"],
  ["refactor", "Changed"],
  ["docs", "Documentation"],
  ["chore", "Maintenance"],
  ["other", "Other"],
];

const commits = execFileSync(
  "git",
  ["log", "--no-merges", "--format=%H%x1f%ad%x1f%s%x1e", "--date=short"],
  { encoding: "utf8" },
)
  .split("\x1e")
  .filter((record) => record.trim())
  .map((record) => {
    const [hash, date, subject] = record.trim().split("\x1f");
    const match = subject.match(/^(\w+)(?:\([^)]*\))?!?:\s+(.+)$/);
    return {
      hash,
      date,
      type: match?.[1].toLowerCase() ?? "other",
      subject: match?.[2] ?? subject,
    };
  })
  .filter(({ subject }) => subject !== "update changelog");

const changelog = renderChangelog(commits);

if (process.argv.includes("--check")) {
  let currentChangelog = "";

  try {
    currentChangelog = readFileSync(changelogPath, "utf8");
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }

  if (currentChangelog !== changelog) {
    console.error("CHANGELOG.md is out of date. Run: npm run changelog");
    process.exitCode = 1;
  }
} else {
  writeFileSync(changelogPath, changelog);
}

function getCommitUrlBase() {
  const remoteUrl = execFileSync("git", ["remote", "get-url", "origin"], {
    encoding: "utf8",
  }).trim();
  const repository = remoteUrl
    .replace(/^git@([^:]+):/, "https://$1/")
    .replace(/\.git$/, "");

  return `${repository}/commit`;
}

function renderChangelog(entries) {
  const entriesByDate = new Map();

  for (const entry of entries) {
    const datedEntries = entriesByDate.get(entry.date) ?? [];
    datedEntries.push(entry);
    entriesByDate.set(entry.date, datedEntries);
  }

  const sections = [...entriesByDate].map(([date, datedEntries]) => {
    const entriesByType = new Map(categories.map(([type]) => [type, []]));

    for (const entry of datedEntries) {
      const category = entriesByType.has(entry.type) ? entry.type : "other";
      entriesByType.get(category).push(entry);
    }

    const categorySections = categories
      .map(([type, heading]) => {
        const typedEntries = entriesByType.get(type);

        if (typedEntries.length === 0) {
          return "";
        }

        const lines = typedEntries.map(
          ({ hash, subject }) =>
            `- ${escapeMarkdown(subject)} ([${hash.slice(0, 7)}](${commitUrlBase}/${hash}))`,
        );

        return `### ${heading}\n${lines.join("\n")}`;
      })
      .filter(Boolean);

    return `## ${date}\n\n${categorySections.join("\n\n")}`;
  });

  return `# Changelog

All notable changes to this project are documented here. This file is generated
from the Git commit history; do not edit it manually. Run \`npm run changelog\`
to regenerate it.

${sections.join("\n\n")}
`;
}

function escapeMarkdown(value) {
  return value.replace(/([\\`*_[\]<>])/g, "\\$1");
}
