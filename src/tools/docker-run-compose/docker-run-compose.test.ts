import { describe, expect, it } from 'vitest'
import { parse } from 'yaml'
import { convertComposeToDockerRun, convertDockerRunToCompose } from './docker-run-compose'

describe('docker-run-compose', () => {
  describe('convertComposeToDockerRun', () => {
    it('converts a rich compose service into a deterministic docker run command', () => {
      const result = convertComposeToDockerRun(`
services:
  web:
    image: nginx:alpine
    container_name: web-prod
    ports:
      - "8080:80"
    environment:
      NODE_ENV: production
      DEBUG: "false"
    env_file:
      - .env
    volumes:
      - "./site:/usr/share/nginx/html:ro"
    working_dir: /app
    user: "1000:1000"
    restart: unless-stopped
    command:
      - nginx
      - -g
      - daemon off;
`)

      expect(result.ok).toBe(true)
      if (!result.ok) return

      expect(result.output).toBe([
        'docker run -d --name web-prod --restart unless-stopped -p 8080:80 --env NODE_ENV=production --env DEBUG=false --env-file .env -v ./site:/usr/share/nginx/html:ro -w /app -u 1000:1000 nginx:alpine nginx -g "daemon off;"',
      ].join('\n'))
      expect(result.warnings).toEqual([])
    })

    it('converts multiple compose services into multiple docker run commands', () => {
      const result = convertComposeToDockerRun(`
services:
  api:
    image: node:24-alpine
    command: npm start
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: app
`)

      expect(result.ok).toBe(true)
      if (!result.ok) return

      expect(result.output.split('\n\n')).toEqual([
        'docker run -d --name api node:24-alpine npm start',
        'docker run -d --name db --env POSTGRES_DB=app postgres:16',
      ])
    })

    it('maps advanced runtime fields including healthcheck and capabilities', () => {
      const result = convertComposeToDockerRun(`
services:
  worker:
    image: example/worker:1.2
    entrypoint:
      - /bin/sh
      - -c
    labels:
      com.example.role: jobs
    dns:
      - 1.1.1.1
    extra_hosts:
      - "host.docker.internal:host-gateway"
    cap_add:
      - NET_ADMIN
    cap_drop:
      - MKNOD
    devices:
      - "/dev/fuse:/dev/fuse"
    platform: linux/amd64
    pull_policy: always
    init: true
    tty: true
    stdin_open: true
    healthcheck:
      test:
        - CMD-SHELL
        - curl -f http://localhost || exit 1
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s
`)

      expect(result.ok).toBe(true)
      if (!result.ok) return

      expect(result.output).toContain('--entrypoint /bin/sh')
      expect(result.output).toContain('--label com.example.role=jobs')
      expect(result.output).toContain('--dns 1.1.1.1')
      expect(result.output).toContain('--add-host host.docker.internal:host-gateway')
      expect(result.output).toContain('--cap-add NET_ADMIN')
      expect(result.output).toContain('--cap-drop MKNOD')
      expect(result.output).toContain('--device /dev/fuse:/dev/fuse')
      expect(result.output).toContain('--platform linux/amd64')
      expect(result.output).toContain('--pull always')
      expect(result.output).toContain('--init')
      expect(result.output).toContain('-t')
      expect(result.output).toContain('-i')
      expect(result.output).toContain('--health-cmd "curl -f http://localhost || exit 1"')
      expect(result.output).toContain('--health-interval 30s')
      expect(result.output).toContain('--health-timeout 5s')
      expect(result.output).toContain('--health-retries 3')
      expect(result.output).toContain('--health-start-period 10s')
    })

    it('warns about compose-only fields that cannot round-trip to docker run', () => {
      const result = convertComposeToDockerRun(`
services:
  app:
    build: .
    image: app:local
    depends_on:
      - db
    secrets:
      - app_secret
    configs:
      - app_config
    profiles:
      - debug
    deploy:
      replicas: 2
volumes:
  db-data:
networks:
  backend:
`)

      expect(result.ok).toBe(true)
      if (!result.ok) return

      expect(result.warnings).toEqual(expect.arrayContaining([
        'service "app" uses build; docker run cannot build images before starting containers.',
        'service "app" uses depends_on; start order is not represented in docker run.',
        'service "app" uses secrets; docker run has no direct Compose secrets equivalent.',
        'service "app" uses configs; docker run has no direct Compose configs equivalent.',
        'service "app" uses profiles; docker run has no profile selection equivalent.',
        'service "app" uses deploy; docker run ignores Compose deployment settings.',
        'top-level volumes are not created by docker run output.',
        'top-level networks are not created by docker run output.',
      ]))
    })

    it('rejects compose documents without a services object', () => {
      const result = convertComposeToDockerRun('version: "3.9"')

      expect(result).toEqual({
        ok: false,
        message: 'Docker Compose 文件必须包含 services 对象。',
      })
    })
  })

  describe('convertDockerRunToCompose', () => {
    it('converts a rich docker run command into compose yaml', () => {
      const result = convertDockerRunToCompose('docker run -d --name web -p 8080:80 -e NODE_ENV=production --env DEBUG=false --env-file .env -v ./site:/usr/share/nginx/html:ro -w /app -u 1000:1000 --restart unless-stopped nginx:alpine nginx -g "daemon off;"')

      expect(result.ok).toBe(true)
      if (!result.ok) return

      const document = parse(result.output) as {
        services: Record<string, Record<string, unknown>>
      }
      expect(document.services.web).toMatchObject({
        image: 'nginx:alpine',
        container_name: 'web',
        ports: ['8080:80'],
        environment: {
          NODE_ENV: 'production',
          DEBUG: 'false',
        },
        env_file: ['.env'],
        volumes: ['./site:/usr/share/nginx/html:ro'],
        working_dir: '/app',
        user: '1000:1000',
        restart: 'unless-stopped',
        command: ['nginx', '-g', 'daemon off;'],
      })
      expect(result.warnings).toEqual([])
    })

    it('maps advanced docker run flags into compose service fields', () => {
      const result = convertDockerRunToCompose('docker run -it --init --privileged --cap-add NET_ADMIN --cap-drop MKNOD --device /dev/fuse:/dev/fuse --platform linux/amd64 --pull always --entrypoint /bin/sh --label com.example.role=jobs --dns 1.1.1.1 --add-host host.docker.internal:host-gateway --hostname worker --network backend --health-cmd "curl -f http://localhost || exit 1" --health-interval 30s --health-timeout 5s --health-retries 3 --health-start-period 10s example/worker:1.2 -c "echo hi"')

      expect(result.ok).toBe(true)
      if (!result.ok) return

      const document = parse(result.output) as {
        services: Record<string, Record<string, unknown>>
      }
      expect(document.services.worker).toMatchObject({
        image: 'example/worker:1.2',
        init: true,
        tty: true,
        stdin_open: true,
        privileged: true,
        cap_add: ['NET_ADMIN'],
        cap_drop: ['MKNOD'],
        devices: ['/dev/fuse:/dev/fuse'],
        platform: 'linux/amd64',
        pull_policy: 'always',
        entrypoint: '/bin/sh',
        labels: {
          'com.example.role': 'jobs',
        },
        dns: ['1.1.1.1'],
        extra_hosts: ['host.docker.internal:host-gateway'],
        hostname: 'worker',
        networks: ['backend'],
        healthcheck: {
          test: ['CMD-SHELL', 'curl -f http://localhost || exit 1'],
          interval: '30s',
          timeout: '5s',
          retries: 3,
          start_period: '10s',
        },
        command: ['-c', 'echo hi'],
      })
    })

    it('converts multiple docker run commands into multiple compose services', () => {
      const result = convertDockerRunToCompose([
        'docker run --name redis redis:7',
        'docker run -e POSTGRES_DB=app postgres:16',
      ].join('\n'))

      expect(result.ok).toBe(true)
      if (!result.ok) return

      const document = parse(result.output) as {
        services: Record<string, Record<string, unknown>>
      }
      expect(Object.keys(document.services)).toEqual(['redis', 'postgres'])
      expect(document.services.redis.image).toBe('redis:7')
      expect(document.services.postgres.environment).toEqual({
        POSTGRES_DB: 'app',
      })
    })

    it('warns about unsupported or lossy docker run flags', () => {
      const result = convertDockerRunToCompose('docker run --rm --cidfile container.cid --log-driver json-file --memory 128m --cpus 1.5 --unknown value nginx:alpine')

      expect(result.ok).toBe(true)
      if (!result.ok) return

      expect(result.warnings).toEqual(expect.arrayContaining([
        '--rm is runtime-only and is not represented in Compose output.',
        '--cidfile is not represented in Compose output.',
        '--log-driver is daemon/runtime logging configuration and may not round-trip.',
        '--memory is resource configuration; Compose support depends on runtime mode.',
        '--cpus is resource configuration; Compose support depends on runtime mode.',
        'Unrecognized docker run flag --unknown was not converted.',
      ]))
    })

    it('rejects commands that are not docker run', () => {
      const result = convertDockerRunToCompose('docker ps')

      expect(result).toEqual({
        ok: false,
        message: '请输入 docker run 命令。',
      })
    })

    it('rejects unterminated shell quotes', () => {
      const result = convertDockerRunToCompose('docker run --name "web nginx')

      expect(result).toEqual({
        ok: false,
        message: 'docker run 命令解析失败：引号未闭合。',
      })
    })
  })
})
