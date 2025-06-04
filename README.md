firstblox AWS tools - TypeScript
---------------------------------

# Table of Contents

[Overview](#overview)

[Install](#install)

[Development](#development)

[Execution](#execution)

# Overview

![Title](docs/images/title-card.png)

> [!NOTE]
> This codebase utilises some concepts and some reference code from the excellent series by Lee Gilmore on CDK pipelines best practices.
> See part 1 [here](https://github.com/leegilmorecode/Serverless-AWS-CDK-Best-Practices-Patterns).
> I highly recommend you checkout the whole series.

> [!IMPORTANT]
> This codebase is currently a reference repository ONLY.
> Developers should customise to their environment and requirements.
> See `src/config/index.ts` for all configurations

**Whats included?**

- Projen TS project scaffolding.
- Commander to script options
- Inquirer for input propmpts
- CLI feedback for command line loader feedback

- Optional dynamic fetching of SSM stored aws account ids.

**Pre-requisites**

- Node/TS installed.
- Projen installed.
- AWS account credentials

# Install

## Initial installation

Ensure pnpm is installed.

```bash
npm install -g pnpm
```

Install dependencies.

```bash
pnpm i
```

## Adding dependencies

Any new dependencies must be added to `.projenrc` at the root of the project.

## Using Projen

Once the initial installation of dependencies complete, in order to keep all project configuration files and dependencies in sync, each time `.projenrc` is updated run the following command.

```
npx projen
```

# Development

## Projen

To configure the project and project dependencies please modify `.projenrc` ONLY.

A good rule of thumb:

- Utilise projenrc in all cases where projen supports a configuration action/type.
- Apply a manual addition/change in cases where projen does not support a configuration action/type or it cannot be customised through projen.

Once configuration changes are made via `.projenrc` run the below command.

```bash
npx projen
```

## Adding new scripts

Add new scripts to [./src/lib/scripts](./src/lib/scripts/).

# Execution

## AWS Credentials

Setup aws credentials for your target AWS account using your preferred method.

## Available script(s)

See available scripts [package.json](./package.json).

### Create RDS Snapshots

```bash
npm run create-share-rds-snapshot
```

**Create and Share RDS Snapshot output - DRY RUN**

![Title](docs/images/title-card.png)

**Create and Share RDS Snapshot output**

![Title](docs/images/title-card.png)