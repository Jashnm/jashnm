import { promises as fs } from "fs";
import path from "path";
import fetch from "node-fetch";

const year = new Date().getFullYear();

const main = async () => {
  const template = await (
    await fs.readFile(path.join(process.cwd(), "/README.template.md"))
  ).toString("utf-8");

  const getGhCommits = async () => {
    try {
      const response = await fetch(`https://api.github.com/user/emails`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/vnd.github.cloak-preview",
          Authorization: `bearer ${process.env.JASHN_GH_PCT}`
        }
      });
      let emailsList = await response.json();
      const commits = await Promise.all(
        emailsList.map((x) => getCommitsByEmail(x.email))
      );

      const commitCount = commits.reduce((acc, curr) => acc + curr);

      let committedTreesText = `Committed trees(${year}): `;
      if (!!commitCount) {
        const readme = template.replace(
          "{committed_trees}",
          `${committedTreesText}${commitCount}  \n ${Array(commitCount)
            .fill("🌳")
            .join("")}`
        );

        await fs.writeFile("README.md", readme);
      }
    } catch (err) {
      console.log(err);
    }
  };
  getGhCommits();
};

const getCommitsByEmail = async (email) => {
  try {
    const res = await fetch(
      `https://api.github.com/search/commits?q=author-email:${email}+author-date:>${
        year - 1
      }`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/vnd.github.cloak-preview",
          Authorization: `bearer ${process.env.JASHN_GH_PCT}`
        }
      }
    );

    const myCommits = await res.json();

    return myCommits.total_count;
  } catch (err) {
    console.log(err);
  }
};

main();
