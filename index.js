import { promises as fs } from "fs";
import path from "path";
import fetch from "node-fetch";

const main = async () => {
  const template = await (
    await fs.readFile(path.join(process.cwd(), "/README.template.md"))
  ).toString("utf-8");

  const getGhCommits = async () => {
    const year = new Date().getFullYear();
    try {
      const res = await fetch(
        `https://api.github.com/search/commits?q=author:jashnm+author-date:>${
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

      let committedTreesText = `Committed trees(${year}): `;

      if (myCommits && myCommits.total_count) {
        const readme = template.replace(
          "{committed_trees}",
          `${committedTreesText}${myCommits.total_count}  \n ${Array(
            myCommits.total_count
          )
            .fill(null)
            .map(() => "🌳")
            .join("")}`
        );

        await fs.writeFile("README.md", readme);
      }
    } catch (err) {
      console.log(err);
    }

    return;
  };
  getGhCommits();
};

main();
