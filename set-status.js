const { Octokit } = require("@octokit/rest");
const yargs = require("yargs");

// Parse command-line arguments
const argv = yargs
    .option("repo", {
        alias: "r",
        description: "GitHub repository in the format 'owner/repo'",
        type: "string",
        demandOption: true,
    })
    .option("sha", {
        alias: "s",
        description: "Commit SHA to set the status for",
        type: "string",
        demandOption: true,
    })
    .option("state", {
        alias: "t",
        description: "State of the status (pending, success, error, or failure)",
        type: "string",
        choices: ["pending", "success", "error", "failure"],
        demandOption: true,
    })
    .option("context", {
        alias: "c",
        description: "A string label to differentiate this status from others",
        type: "string",
        default: "default",
    })
    .option("description", {
        alias: "d",
        description: "A short description of the status",
        type: "string",
        default: "",
    })
    .option("target_url", {
        alias: "u",
        description: "URL to associate with this status",
        type: "string",
        default: "",
    })
    .help()
    .alias("help", "h").argv;

// GitHub personal access token (set this as an environment variable)
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
    console.error("Error: GITHUB_TOKEN environment variable is not set.");
    process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

(async () => {
    try {
        const [owner, repo] = argv.repo.split("/");
        const { sha, state, context, description, target_url } = argv;

        await octokit.repos.createCommitStatus({
            owner,
            repo,
            sha,
            state,
            context,
            description,
            target_url,
        });

        console.log(`Status '${state}' set successfully for commit ${sha}`);
    } catch (error) {
        console.error("Error setting status:", error.message);
        process.exit(1);
    }
})();