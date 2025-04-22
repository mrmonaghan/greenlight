# Greenlight

`greenlight` is a tool for managing the mergeability of Github pull requests based on a set of required status checks. It is designed as an event-driven alternative to tools like [merge-gatekeeper](https://github.com/upsidr/merge-gatekeeper) which, by design, are somewhat inefficient.

## How It Works

`greenlight` is intended to act as the sole [required status check](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/troubleshooting-required-status-checks) on the repository, and therefore the single source of truth concerning mergeability. 

It monitors the status checks on pull requests and compares them against the defined `require` and `ignore` lists to determine if the pull request satisfies the configured criteria. This consolidated status is displayed via a comment indicating the state of each required status check, as well as via the `greenlight` status check that will be added to the pull request.

## Config File

`greenlight` supports the following configuration options

Required status checks are defined in the `config.yaml` file:

```
status:
  require:
  - 'CI/CD Pipeline'
```

By default, `greenlight` ignores status checks that aren't included in `status.require`. You can invert this with strict mode (see below) to require all present statuses to succeed before the pull request is considered mergeable. 

This configuration will result in `greenlight` only monitoring for the 'CI/CD Pipeline' status check. 

Adding another status follows the same logic:

```
status:
  require:
  - 'CI/CD Pipeline'
  - 'Integration Tests'
```

Now `greenlight` will require both 'CI/CD Pipeline' and 'Integration Tests' status checks to be present with a state of `success` before marking the pull request as mergeable.

### Strict Mode & Ignores

Setting `status.strict: true` will cause `greenlight` to consider all present status checks as required in addition to those defined in `status.require`. This is useful when you are unclear about when a conditional workflow may run, but want to enforce its success when it does.

You can explicitly ignore status checks when using strict mode to prevent them being evaluated. For example:

```
status:
  strict: true
  require:
  - 'CI/CD Pipeline'
  - 'Integration Tests'
  ignore:
  - 'Irrelevant Status Check'
```

### Branches

`greenlight` can both `include` and `ignore` branch patterns to limit the pull requests it operates on. This is configured via `branch.include` and `branch.ignore`:

```
branch:
  include:
    - dev-branch-*
  ignore:
    - test-branch-*
```

Branch rules are evaluated `ignores > includes`, so if a branch matches both an `ignore` and an `includes` pattern, it will be ignored. In this case, `greenlight` responds with a `200` and message indicating the branch was ignored.