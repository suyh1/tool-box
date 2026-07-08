# Docker Run / Compose Converter Design

Date: 2026-07-08
Branch: `main`

## Goal

Add a local-only tool that converts between Docker Compose YAML and `docker run` commands, with broad option coverage and explicit warnings for Docker/Compose semantics that cannot be represented losslessly.

## Product Shape

The tool should be discoverable as its own entry, "Docker Run / Compose 互换", and should also appear inside the existing DevOps YAML suite. It uses the existing toolbox pattern: input on the left, generated output on the right, a direction switch, sample/reset/copy actions, and an aria-live announcer.

The UI has two modes:

- Compose -> docker run: accepts Compose YAML and emits one `docker run` command per service.
- docker run -> Compose: accepts one or more `docker run` commands and emits Compose YAML.

The tool is local-only. It never shells out to Docker and never connects to a daemon or network.

## Conversion Scope

### Compose -> docker run

Map common runtime fields:

- `image`, `container_name`, `ports`, `environment`, `env_file`
- `volumes`, `working_dir`, `user`, `command`, `entrypoint`
- `restart`, `networks`, `hostname`, `dns`, `extra_hosts`, `labels`
- `privileged`, `cap_add`, `cap_drop`, `devices`, `platform`, `pull_policy`
- `init`, `tty`, `stdin_open`, and `healthcheck`

When a Compose document contains multiple services, emit multiple commands separated by blank lines. Prefer deterministic flag ordering so tests and copy/paste output are stable.

Emit warnings for fields that cannot be represented by a single `docker run` command or are only partially represented:

- `build`, `depends_on`, `secrets`, `configs`, `profiles`, `deploy`
- `extends`, `links`, top-level `volumes`, top-level `networks`, and unknown service keys

### docker run -> Compose

Parse shell-like command strings with quotes, escapes, `--flag value`, `--flag=value`, and common short flags. Support multiple commands in one input.

Map these flags into a Compose service:

- `--name`, `--publish` / `-p`, `--env` / `-e`, `--env-file`
- `--volume` / `-v`, `--mount`
- `--workdir` / `-w`, `--user` / `-u`, `--network`
- `--hostname`, `--dns`, `--add-host`, `--label`
- `--restart`, `--entrypoint`, `--privileged`
- `--cap-add`, `--cap-drop`, `--device`, `--platform`, `--pull`
- `--init`, `--tty` / `-t`, `--interactive` / `-i`
- `--health-cmd`, `--health-interval`, `--health-timeout`, `--health-retries`, `--health-start-period`, `--no-healthcheck`

The image token becomes `image`. Tokens after the image become `command`. If no `--name` exists, generate a safe service name from the image.

Emit warnings for flags that are intentionally ignored or cannot be expressed well in Compose, including `--rm`, `--cidfile`, logging-only flags, resource flags that are platform-specific, and unrecognized flags.

## Architecture

Create a pure TypeScript conversion module under `src/tools/docker-run-compose/`. It owns parsing, normalization, conversion, formatting, and warning generation. The Vue component should remain thin: it selects direction, calls the module, displays output and warnings, and handles copy/sample/reset.

Use the `yaml` package already in the project for Compose parsing/stringifying. Use a small internal shell tokenizer rather than a full shell parser; the target is Docker command lines, not arbitrary shell programs.

## Error Handling

Invalid Compose YAML returns a localized error. Missing `services`, missing image/build data, missing image in `docker run`, and unterminated shell quotes should produce actionable messages. Partial conversions should still return output when possible and include warnings.

## Testing

Use TDD for the converter module first:

- Compose single-service conversion.
- Compose multi-service conversion.
- Complex ports, env, volumes, labels, entrypoint, command, healthcheck.
- Compose-only warnings.
- `docker run` parsing with quotes and `--flag=value`.
- `docker run` conversion with multiple commands.
- Unsupported flag warnings.

Add a focused Playwright test for both UI directions after the unit tests are green.
