# Greenlight

`greenlight` is a lightweight, containerized tool for managing the mergeability of Github pull requests based on a set of required status checks. It is designed as an event-driven alternative to tools like [merge-gatekeeper](https://github.com/upsidr/merge-gatekeeper) which, by design, are somewhat inefficient.

## How It Works

`greenlight` is intended to act as the sole [required status check](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/troubleshooting-required-status-checks) on the repository, and therefore the single source of truth concerning mergeability. 

It monitors the the state of each status check on a pull request, and determines the pull request's mergeability by comparing the live statuses against a pre-defined or dynamically-generated list of required statuses.

`greenlight` refreshes the mergeability of a pull request when it recieves a webhook event, or when the auther comments `/greenlight refresh`.

`greenlight` surfaces a pull requset's merge status via the `greenlight` status check, and via a dashboard comment (pictured):

![alt text](docs/images/image.png "greenlight comment")

## Getting Started

`greenlight` is a containerized tool, meaning it can be run on any number of platforms. To get started with `greenlight` locally, you can use `ngrok` to create an externally-accessible endpoint for the local `greenlight` container.

### Prerequisites

- [Create a Github Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) with `repo.*` permissions.
- Install & configure `ngrok` using [these instructions](https://ngrok.com/docs/getting-started/?os=linux).

Once prerequisites have been completed, create a basic `greenlight.yaml` configuration file:

```
# greenlight.yaml
status:
  require:
    - 'Your Required Status Check'
```

Then, start the `greenlight` container with your configuration mounted at `/app/greenlight.yaml`:

```bash
docker run -d \
  -v $(pwd)/greenlight.yaml:/app/greenlight.yaml \
  -e GITHUB_TOKEN=$GITHUB_TOKEN \
  -p 3000:3000 \
  mrmonaghan/greenlight:latest
```

Once the container has started, start `ngrok` and point it at the base URL of the local container: 

```
ngrok http http://localhost:3000
```

This will print out a disposable URL at which your local `greenlight` container will be publicly accessible. Use this URL to configure a Github webhook on your repository with the following attributes:

```
url: https://$ngrokUrl/github/webhook
content-type: application/json
events:
  statuses
  issue_comments
```

You can confirm everything is working by commenting `/greenlight refresh` on your pull request; you should see subsquent logs being emitted from the `greenlight` container in response:

```
{"message": "handling issue_comment event id: ..."}
```

A `greenlight` status check and associated comment will also be created indicating the merge status of the pull request.

## greenlight.yaml

`greenlight` is configured using the `greenlight.yaml` file, which supports the following options:

```yaml
status:
  strict: false
  require:
    - 'Status That Must Succeed'
  ignore:
    - 'Status I Don't Care About'

branch:
  include:
    - feat-branch-*
  exclude:
    - docs-branch-*
```

### configuration options

| option | description | default |
|--      |--           |--       |
| `status.require` | A list of unignored status checks that are required to be present with a state of `success` in order for the pull request to be mergeable. If a check is present in both `status.require` and `status.ignore`, it will be ignored. | `[]` | 
| `status.ignore` | A list of status checks to ignore during evaluation. Typically used in combination with `strict=true` | `[]` |
| `status.strict` | When `true`, require *all* present, unignored status checks to pass before considering the pull request mergeable. When `strict=true`, both `status.require` and  `status.ignore` can still be used. The heirarchy of evaluation is `ignore > required > present` | `false` |
| `branch.include` | A list of glob expressions the pull request branch must match in order for `greenlight` to take action. Eg: `example-branch-*` | `[]` |
| `branch.ignore` | The inverse of `branch.include`. `greenlight` will ignore any branch that matches a glob pattern in `branch.ignore`. Ignore rules are always evaluated first, meaning if a branch matches both a `branch.include` and a `branch.ignore` pattern, it will be ignored.


## Environment Variables

The following environment variables can also be used to configure `greenlight`:

| var | description | default | required? |
|--      |--           |--       |--      |
| `GITHUB_TOKEN` | The Github PAT that will be used to authenticate. Requires `repo.*` permissions. | `null` | `yes` |
| `CONFIG_FILE` | Full path to the `greenlight.yaml` file. | `/app/greenlight.yaml` |  `no` | 