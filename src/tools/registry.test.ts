import { describe, expect, it } from 'vitest'
import { getToolById, tools } from './registry'

describe('tool registry', () => {
  it('contains unique ids and paths', () => {
    expect(new Set(tools.map((tool) => tool.id)).size).toBe(tools.length)
    expect(new Set(tools.map((tool) => tool.path)).size).toBe(tools.length)
  })

  it('looks up tools by id', () => {
    expect(getToolById('json')?.title).toBe('JSON 格式化')
    expect(getToolById('ini-properties')?.title).toBe('INI / Properties 转换')
    expect(getToolById('json-organize')?.title).toBe('JSON 排序 / 去重')
    expect(getToolById('json-patch')?.title).toBe('JSON Patch / Merge Patch')
    expect(getToolById('json-schema-generate')?.title).toBe('JSON Schema 生成器')
    expect(getToolById('json-schema-validate')?.title).toBe('JSON Schema 校验')
    expect(getToolById('jsonpath')?.title).toBe('JSONPath 查询器')
    expect(getToolById('json-type')?.title).toBe('JSON 转类型')
    expect(getToolById('aes')?.title).toBe('AES 加密 / 解密')
    expect(getToolById('ascii')?.title).toBe('ASCII / 字符码表')
    expect(getToolById('bcrypt')?.title).toBe('bcrypt 哈希 / 校验')
    expect(getToolById('binary')?.title).toBe('Binary 编解码')
    expect(getToolById('brotli')?.title).toBe('Brotli 压缩 / 解压')
    expect(getToolById('gzip')?.title).toBe('Gzip 压缩 / 解压')
    expect(getToolById('markdown-preview')?.title).toBe('Markdown 预览')
    expect(getToolById('markdown-toc')?.title).toBe('Markdown TOC 生成')
    expect(getToolById('number-base')?.title).toBe('Number Base 转换')
    expect(getToolById('password')?.title).toBe('密码生成器')
    expect(getToolById('passphrase')?.title).toBe('Passphrase 生成器')
    expect(getToolById('lorem-ipsum')?.title).toBe('Lorem Ipsum 生成器')
    expect(getToolById('mock-json')?.title).toBe('Mock JSON 数据生成')
    expect(getToolById('random-string')?.title).toBe('随机字符串生成器')
    expect(getToolById('snowflake')?.title).toBe('Snowflake ID 解析 / 生成')
    expect(getToolById('ulid')?.title).toBe('ULID 生成')
    expect(getToolById('nanoid')?.title).toBe('Nano ID 生成')
    expect(getToolById('qr-code')?.title).toBe('QR Code 生成')
    expect(getToolById('qr-decode')?.title).toBe('QR Code 解码')
    expect(getToolById('yaml-json')?.title).toBe('YAML / JSON 转换')
    expect(getToolById('cron')?.title).toBe('Cron 表达式解析')
    expect(getToolById('csv-json')?.title).toBe('CSV / JSON 转换')
    expect(getToolById('csv-sql')?.title).toBe('CSV / SQL INSERT 生成')
    expect(getToolById('csv-table')?.title).toBe('CSV 表格查看器')
    expect(getToolById('css')?.title).toBe('CSS 格式化')
    expect(getToolById('color')?.title).toBe('Color Picker / 转换')
    expect(getToolById('palette')?.title).toBe('调色板生成')
    expect(getToolById('contrast')?.title).toBe('对比度检查器')
    expect(getToolById('regex-helper')?.title).toBe('正则解释 / 生成辅助')
    expect(getToolById('text-stats')?.title).toBe('文本统计')
    expect(getToolById('line-tools')?.title).toBe('行排序 / 去重')
    expect(getToolById('list-random')?.title).toBe('列表随机化 / 抽样')
    expect(getToolById('delimiter-convert')?.title).toBe('分隔符转换')
    expect(getToolById('string-escape')?.title).toBe('字符串转义')
    expect(getToolById('slug')?.title).toBe('Slug 生成')
    expect(getToolById('pinyin')?.title).toBe('拼音转换')
    expect(getToolById('extractor')?.title).toBe('提取 URL / 邮箱 / IP')
    expect(getToolById('template-replace')?.title).toBe('文本模板替换')
    expect(getToolById('url-parser')?.title).toBe('URL 解析器')
    expect(getToolById('query-editor')?.title).toBe('Query 参数编辑器')
    expect(getToolById('http-headers')?.title).toBe('HTTP Header 解析器')
    expect(getToolById('cookie-parser')?.title).toBe('Cookie 解析器')
    expect(getToolById('user-agent')?.title).toBe('User-Agent 解析器')
    expect(getToolById('oauth-url')?.title).toBe('OAuth URL 生成器')
    expect(getToolById('openapi-viewer')?.title).toBe('OpenAPI Viewer / Validator')
    expect(getToolById('graphql-format')?.title).toBe('GraphQL Formatter')
    expect(getToolById('graphql-variables')?.title).toBe('GraphQL Variables 合并检查')
    expect(getToolById('websocket-echo')?.title).toBe('WebSocket Echo Client')
    expect(getToolById('har-viewer')?.title).toBe('HAR Viewer')
    expect(getToolById('ip-cidr')?.title).toBe('IP / CIDR 计算器')
    expect(getToolById('ip-convert')?.title).toBe('IPv4 / IPv6 转换')
    expect(getToolById('mac-address')?.title).toBe('MAC 地址格式化 / 厂商查询')
    expect(getToolById('dns-query')?.title).toBe('DNS 查询')
    expect(getToolById('connection-string')?.title).toBe('连接字符串解析器')
    expect(getToolById('sql-bind')?.title).toBe('SQL 参数绑定预览')
    expect(getToolById('mongo-objectid')?.title).toBe('Mongo ObjectId 解析')
    expect(getToolById('redis-command')?.title).toBe('Redis 命令格式化')
    expect(getToolById('env-convert')?.title).toBe('.env 解析 / JSON 转换')
    expect(getToolById('docker-compose')?.title).toBe('Docker Compose 校验 / 展开')
    expect(getToolById('kubernetes-yaml')?.title).toBe('Kubernetes YAML 快速检查')
    expect(getToolById('semver')?.title).toBe('SemVer 比较器')
    expect(getToolById('curl')?.title).toBe('cURL 转代码')
    expect(getToolById('html')?.title).toBe('HTML 格式化')
    expect(getToolById('html-entity')?.title).toBe('HTML Entity 编解码')
    expect(getToolById('hex')?.title).toBe('Hex 编解码')
    expect(getToolById('hmac')?.title).toBe('HMAC 生成')
    expect(getToolById('ecdsa-sign')?.title).toBe('ECDSA 签名 / 验签')
    expect(getToolById('jwk-pem')?.title).toBe('JWK / PEM 转换')
    expect(getToolById('jwt-sign')?.title).toBe('JWT 编码 / 签名 / 验签')
    expect(getToolById('js-ts-format')?.title).toBe('JavaScript / TypeScript 格式化')
    expect(getToolById('rsa-key')?.title).toBe('RSA 密钥生成')
    expect(getToolById('rsa-sign')?.title).toBe('RSA 签名 / 验签')
    expect(getToolById('ssh-key')?.title).toBe('SSH Key Inspector')
    expect(getToolById('sitemap')?.title).toBe('XML Sitemap 格式化')
    expect(getToolById('sql')?.title).toBe('SQL 格式化')
    expect(getToolById('totp')?.title).toBe('TOTP 生成 / 校验')
    expect(getToolById('toml')?.title).toBe('TOML 格式化 / JSON 转换')
    expect(getToolById('unicode-escape')?.title).toBe('Unicode Escape 编解码')
    expect(getToolById('xml')?.title).toBe('XML 格式化')
    expect(getToolById('xml-json')?.title).toBe('XML / JSON 转换')
    expect(getToolById('xml-xpath')?.title).toBe('XML 校验 / XPath 测试')
    expect(getToolById('csr')?.title).toBe('CSR 解析')
    expect(getToolById('x509-cert')?.title).toBe('X.509 证书解析')
    expect(getToolById('missing')).toBeUndefined()
  })

  it('marks all initial tools as active', () => {
    expect(tools.every((tool) => tool.status === 'active')).toBe(true)
    expect(tools.filter((tool) => tool.status === 'planned')).toHaveLength(0)
  })

  it('includes catalog metadata for directory browsing', () => {
    for (const tool of tools) {
      expect(tool.group, `${tool.id} group`).toBeTruthy()
      expect(tool.order, `${tool.id} order`).toEqual(expect.any(Number))
      expect(tool.keywords.length, `${tool.id} keywords`).toBeGreaterThan(0)
    }
  })

  it('registers JSON organize in the JSON / YAML formatting group', () => {
    expect(getToolById('json-organize')).toMatchObject({
      path: '/tools/json-organize',
      category: 'format',
      group: 'JSON / YAML',
      aliases: expect.arrayContaining(['json sort', 'json dedupe', 'json path']),
      order: 15,
      status: 'active',
    })
  })

  it('registers JSONPath in the query code group', () => {
    expect(getToolById('jsonpath')).toMatchObject({
      path: '/tools/jsonpath',
      category: 'code',
      group: 'Query',
      aliases: expect.arrayContaining(['json query', 'json path tester']),
      order: 30,
      status: 'active',
    })
  })

  it('registers JSON Schema validation in the schema formatting group', () => {
    expect(getToolById('json-schema-validate')).toMatchObject({
      path: '/tools/json-schema-validate',
      category: 'format',
      group: 'Schema',
      aliases: expect.arrayContaining(['json schema validator', 'schema validation']),
      order: 40,
      status: 'active',
    })
  })

  it('registers JSON Schema generation in the schema code group', () => {
    expect(getToolById('json-schema-generate')).toMatchObject({
      path: '/tools/json-schema-generate',
      category: 'code',
      group: 'Schema',
      aliases: expect.arrayContaining(['schema generator', 'json schema infer']),
      order: 40,
      status: 'active',
    })
  })

  it('registers JSON Patch in the JSON / YAML code group', () => {
    expect(getToolById('json-patch')).toMatchObject({
      path: '/tools/json-patch',
      category: 'code',
      group: 'JSON / YAML',
      aliases: expect.arrayContaining(['json diff', 'rfc6902', 'rfc7396']),
      order: 50,
      status: 'active',
    })
  })

  it('registers XML formatting in the XML formatting group', () => {
    expect(getToolById('xml')).toMatchObject({
      path: '/tools/xml',
      category: 'format',
      group: 'XML',
      aliases: expect.arrayContaining(['xml formatter', 'xml validator']),
      order: 50,
      status: 'active',
    })
  })

  it('registers XML JSON conversion in the XML formatting group', () => {
    expect(getToolById('xml-json')).toMatchObject({
      path: '/tools/xml-json',
      category: 'format',
      group: 'XML',
      aliases: expect.arrayContaining(['xml to json', 'json to xml']),
      order: 60,
      status: 'active',
    })
  })

  it('registers XML XPath in the XML formatting group', () => {
    expect(getToolById('xml-xpath')).toMatchObject({
      path: '/tools/xml-xpath',
      category: 'format',
      group: 'XML',
      aliases: expect.arrayContaining(['xpath tester', 'xml query']),
      order: 70,
      status: 'active',
    })
  })

  it('registers TOML conversion in the config formatting group', () => {
    expect(getToolById('toml')).toMatchObject({
      path: '/tools/toml',
      category: 'format',
      group: 'Config',
      aliases: expect.arrayContaining(['toml formatter', 'toml to json']),
      order: 80,
      status: 'active',
    })
  })

  it('registers INI properties conversion in the config formatting group', () => {
    expect(getToolById('ini-properties')).toMatchObject({
      path: '/tools/ini-properties',
      category: 'format',
      group: 'Config',
      aliases: expect.arrayContaining(['ini converter', 'properties converter']),
      order: 90,
      status: 'active',
    })
  })

  it('registers CSV JSON conversion in the CSV formatting group', () => {
    expect(getToolById('csv-json')).toMatchObject({
      path: '/tools/csv-json',
      category: 'format',
      group: 'CSV',
      aliases: expect.arrayContaining(['csv to json', 'json to csv']),
      order: 100,
      status: 'active',
    })
  })

  it('registers CSV table viewer in the CSV formatting group', () => {
    expect(getToolById('csv-table')).toMatchObject({
      path: '/tools/csv-table',
      category: 'format',
      group: 'CSV',
      aliases: expect.arrayContaining(['csv viewer', 'table preview']),
      order: 110,
      status: 'active',
    })
  })

  it('registers CSV SQL insert generator in the database code group', () => {
    expect(getToolById('csv-sql')).toMatchObject({
      path: '/tools/csv-sql',
      category: 'code',
      group: 'Database',
      aliases: expect.arrayContaining(['csv to sql', 'insert generator']),
      order: 35,
      status: 'active',
    })
  })

  it('registers Markdown preview in the Markdown formatting group', () => {
    expect(getToolById('markdown-preview')).toMatchObject({
      path: '/tools/markdown-preview',
      category: 'format',
      group: 'Markdown',
      aliases: expect.arrayContaining(['markdown renderer', 'md preview']),
      order: 120,
      status: 'active',
    })
  })

  it('registers Markdown TOC generation in the Markdown text group', () => {
    expect(getToolById('markdown-toc')).toMatchObject({
      path: '/tools/markdown-toc',
      category: 'text',
      group: 'Markdown',
      aliases: expect.arrayContaining(['markdown toc', 'table of contents']),
      order: 40,
      status: 'active',
    })
  })

  it('registers HTML formatting in the web markup formatting group', () => {
    expect(getToolById('html')).toMatchObject({
      path: '/tools/html',
      category: 'format',
      group: 'Web Markup',
      aliases: expect.arrayContaining(['html formatter', 'html minifier']),
      order: 130,
      status: 'active',
    })
  })

  it('registers CSS formatting in the web code formatting group', () => {
    expect(getToolById('css')).toMatchObject({
      path: '/tools/css',
      category: 'format',
      group: 'Web Code',
      aliases: expect.arrayContaining(['css formatter', 'css minifier']),
      order: 140,
      status: 'active',
    })
  })

  it('registers JavaScript TypeScript formatting in the web code formatting group', () => {
    expect(getToolById('js-ts-format')).toMatchObject({
      path: '/tools/js-ts-format',
      category: 'format',
      group: 'Web Code',
      aliases: expect.arrayContaining(['javascript formatter', 'typescript formatter']),
      order: 150,
      status: 'active',
    })
  })

  it('registers color conversion in the color formatting group', () => {
    expect(getToolById('color')).toMatchObject({
      path: '/tools/color',
      category: 'format',
      group: 'Color',
      aliases: expect.arrayContaining(['color converter', 'hex rgb hsl']),
      order: 160,
      status: 'active',
    })
  })

  it('registers palette generation in the color generator group', () => {
    expect(getToolById('palette')).toMatchObject({
      path: '/tools/palette',
      category: 'generate',
      group: 'Color',
      aliases: expect.arrayContaining(['palette generator', 'color harmony']),
      order: 50,
      status: 'active',
    })
  })

  it('registers contrast checking in the color formatting group', () => {
    expect(getToolById('contrast')).toMatchObject({
      path: '/tools/contrast',
      category: 'format',
      group: 'Color',
      aliases: expect.arrayContaining(['contrast checker', 'wcag contrast']),
      order: 170,
      status: 'active',
    })
  })

  it('registers XML Sitemap formatting in the web markup formatting group', () => {
    expect(getToolById('sitemap')).toMatchObject({
      path: '/tools/sitemap',
      category: 'format',
      group: 'Web Markup',
      aliases: expect.arrayContaining(['sitemap validator', 'xml sitemap']),
      order: 135,
      status: 'active',
    })
  })

  it('registers HTML Entity encoding in the text encoding group', () => {
    expect(getToolById('html-entity')).toMatchObject({
      path: '/tools/html-entity',
      category: 'encode',
      group: 'Text Encoding',
      aliases: expect.arrayContaining(['html entities', 'entity decode']),
      order: 30,
      status: 'active',
    })
  })

  it('registers Unicode escape encoding in the text encoding group', () => {
    expect(getToolById('unicode-escape')).toMatchObject({
      path: '/tools/unicode-escape',
      category: 'encode',
      group: 'Text Encoding',
      aliases: expect.arrayContaining(['unicode escape', 'u escape']),
      order: 40,
      status: 'active',
    })
  })

  it('registers Hex encoding in the number bases group', () => {
    expect(getToolById('hex')).toMatchObject({
      path: '/tools/hex',
      category: 'encode',
      group: 'Number Bases',
      aliases: expect.arrayContaining(['hex decode', 'hexadecimal']),
      order: 50,
      status: 'active',
    })
  })

  it('registers Binary encoding in the number bases group', () => {
    expect(getToolById('binary')).toMatchObject({
      path: '/tools/binary',
      category: 'encode',
      group: 'Number Bases',
      aliases: expect.arrayContaining(['binary decode', 'base2']),
      order: 60,
      status: 'active',
    })
  })

  it('registers number base conversion in the number bases group', () => {
    expect(getToolById('number-base')).toMatchObject({
      path: '/tools/number-base',
      category: 'encode',
      group: 'Number Bases',
      aliases: expect.arrayContaining(['base converter', 'radix']),
      order: 70,
      status: 'active',
    })
  })

  it('registers ASCII character code table in the reference group', () => {
    expect(getToolById('ascii')).toMatchObject({
      path: '/tools/ascii',
      category: 'encode',
      group: 'Reference',
      aliases: expect.arrayContaining(['ascii table', 'character code']),
      order: 80,
      status: 'active',
    })
  })

  it('registers Gzip compression in the compression group', () => {
    expect(getToolById('gzip')).toMatchObject({
      path: '/tools/gzip',
      category: 'encode',
      group: 'Compression',
      aliases: expect.arrayContaining(['gzip decode', 'gzip base64']),
      order: 90,
      status: 'active',
    })
  })

  it('registers Brotli compression in the compression group', () => {
    expect(getToolById('brotli')).toMatchObject({
      path: '/tools/brotli',
      category: 'encode',
      group: 'Compression',
      aliases: expect.arrayContaining(['brotli decode', 'br base64']),
      order: 100,
      status: 'active',
    })
  })

  it('registers JWT signing in the token security group', () => {
    expect(getToolById('jwt-sign')).toMatchObject({
      path: '/tools/jwt-sign',
      category: 'security',
      group: 'Token',
      aliases: expect.arrayContaining(['jwt sign', 'jwt verify']),
      order: 15,
      status: 'active',
    })
  })

  it('registers JWK PEM conversion in the key security group', () => {
    expect(getToolById('jwk-pem')).toMatchObject({
      path: '/tools/jwk-pem',
      category: 'security',
      group: 'Key',
      aliases: expect.arrayContaining(['jwk to pem', 'pem to jwk']),
      order: 20,
      status: 'active',
    })
  })

  it('registers HMAC generation in the digest security group', () => {
    expect(getToolById('hmac')).toMatchObject({
      path: '/tools/hmac',
      category: 'security',
      group: 'Digest',
      aliases: expect.arrayContaining(['hmac sha256', 'signature hash']),
      order: 30,
      status: 'active',
    })
  })

  it('registers AES encryption in the encryption security group', () => {
    expect(getToolById('aes')).toMatchObject({
      path: '/tools/aes',
      category: 'security',
      group: 'Encryption',
      aliases: expect.arrayContaining(['aes gcm', 'aes decrypt']),
      order: 10,
      status: 'active',
    })
  })

  it('registers RSA key generation in the key security group', () => {
    expect(getToolById('rsa-key')).toMatchObject({
      path: '/tools/rsa-key',
      category: 'security',
      group: 'Key',
      aliases: expect.arrayContaining(['rsa generator', 'rsa keypair']),
      order: 30,
      status: 'active',
    })
  })

  it('registers SSH key inspection in the key security group', () => {
    expect(getToolById('ssh-key')).toMatchObject({
      path: '/tools/ssh-key',
      category: 'security',
      group: 'Key',
      aliases: expect.arrayContaining(['ssh public key', 'authorized_keys']),
      order: 40,
      status: 'active',
    })
  })

  it('registers RSA signing in the signature security group', () => {
    expect(getToolById('rsa-sign')).toMatchObject({
      path: '/tools/rsa-sign',
      category: 'security',
      group: 'Signature',
      aliases: expect.arrayContaining(['rsa verify', 'rsa signature']),
      order: 10,
      status: 'active',
    })
  })

  it('registers ECDSA signing in the signature security group', () => {
    expect(getToolById('ecdsa-sign')).toMatchObject({
      path: '/tools/ecdsa-sign',
      category: 'security',
      group: 'Signature',
      aliases: expect.arrayContaining(['ecdsa verify', 'ec signature']),
      order: 20,
      status: 'active',
    })
  })

  it('registers bcrypt hashing in the password security group', () => {
    expect(getToolById('bcrypt')).toMatchObject({
      path: '/tools/bcrypt',
      category: 'security',
      group: 'Password',
      aliases: expect.arrayContaining(['bcrypt verify', 'password hash']),
      order: 10,
      status: 'active',
    })
  })

  it('registers TOTP generation in the token security group', () => {
    expect(getToolById('totp')).toMatchObject({
      path: '/tools/totp',
      category: 'security',
      group: 'Token',
      aliases: expect.arrayContaining(['otp', '2fa']),
      order: 20,
      status: 'active',
    })
  })

  it('registers password generation in the password generator group', () => {
    expect(getToolById('password')).toMatchObject({
      path: '/tools/password',
      category: 'generate',
      group: 'Password',
      aliases: expect.arrayContaining(['password generator', 'random password']),
      order: 10,
      status: 'active',
    })
  })

  it('registers passphrase generation in the password generator group', () => {
    expect(getToolById('passphrase')).toMatchObject({
      path: '/tools/passphrase',
      category: 'generate',
      group: 'Password',
      aliases: expect.arrayContaining(['passphrase generator', 'diceware']),
      order: 20,
      status: 'active',
    })
  })

  it('registers Lorem Ipsum generation in the mock data generator group', () => {
    expect(getToolById('lorem-ipsum')).toMatchObject({
      path: '/tools/lorem-ipsum',
      category: 'generate',
      group: 'Mock Data',
      aliases: expect.arrayContaining(['lorem ipsum', 'dummy text']),
      order: 10,
      status: 'active',
    })
  })

  it('registers Mock JSON generation in the mock data generator group', () => {
    expect(getToolById('mock-json')).toMatchObject({
      path: '/tools/mock-json',
      category: 'generate',
      group: 'Mock Data',
      aliases: expect.arrayContaining(['mock data', 'json faker']),
      order: 20,
      status: 'active',
    })
  })

  it('registers random string generation in the random generator group', () => {
    expect(getToolById('random-string')).toMatchObject({
      path: '/tools/random-string',
      category: 'generate',
      group: 'Random',
      aliases: expect.arrayContaining(['random text', 'random chars']),
      order: 10,
      status: 'active',
    })
  })

  it('registers Snowflake ID generation in the identifiers generator group', () => {
    expect(getToolById('snowflake')).toMatchObject({
      path: '/tools/snowflake',
      category: 'generate',
      group: 'Identifiers',
      aliases: expect.arrayContaining(['twitter snowflake', 'discord snowflake']),
      order: 20,
      status: 'active',
    })
  })

  it('registers ULID generation in the identifiers generator group', () => {
    expect(getToolById('ulid')).toMatchObject({
      path: '/tools/ulid',
      category: 'generate',
      group: 'Identifiers',
      aliases: expect.arrayContaining(['sortable id', 'ulid generator']),
      order: 30,
      status: 'active',
    })
  })

  it('registers Nano ID generation in the identifiers generator group', () => {
    expect(getToolById('nanoid')).toMatchObject({
      path: '/tools/nanoid',
      category: 'generate',
      group: 'Identifiers',
      aliases: expect.arrayContaining(['nano id', 'nanoid']),
      order: 40,
      status: 'active',
    })
  })

  it('registers QR Code generation in the QR Code generator group', () => {
    expect(getToolById('qr-code')).toMatchObject({
      path: '/tools/qr-code',
      category: 'generate',
      group: 'QR Code',
      aliases: expect.arrayContaining(['qr generator', 'qrcode']),
      order: 10,
      status: 'active',
    })
  })

  it('registers QR Code decoding in the QR Code encoding group', () => {
    expect(getToolById('qr-decode')).toMatchObject({
      path: '/tools/qr-decode',
      category: 'encode',
      group: 'QR Code',
      aliases: expect.arrayContaining(['qr decoder', 'scan qr']),
      order: 10,
      status: 'active',
    })
  })

  it('registers X.509 certificate parsing in the certificate security group', () => {
    expect(getToolById('x509-cert')).toMatchObject({
      path: '/tools/x509-cert',
      category: 'security',
      group: 'Certificate',
      aliases: expect.arrayContaining(['certificate parser', 'tls cert']),
      order: 10,
      status: 'active',
    })
  })

  it('registers CSR parsing in the certificate security group', () => {
    expect(getToolById('csr')).toMatchObject({
      path: '/tools/csr',
      category: 'security',
      group: 'Certificate',
      aliases: expect.arrayContaining(['csr parser', 'certificate request']),
      order: 20,
      status: 'active',
    })
  })

  it('registers regex helper in the text analysis group', () => {
    expect(getToolById('regex-helper')).toMatchObject({
      path: '/tools/regex-helper',
      category: 'text',
      group: 'Text Analysis',
      aliases: expect.arrayContaining(['regex explain', 'regex builder']),
      order: 15,
      status: 'active',
    })
  })

  it('registers text stats in the text analysis group', () => {
    expect(getToolById('text-stats')).toMatchObject({
      path: '/tools/text-stats',
      category: 'text',
      group: 'Text Analysis',
      aliases: expect.arrayContaining(['word count', 'character count']),
      order: 25,
      status: 'active',
    })
  })

  it('registers line tools in the list text group', () => {
    expect(getToolById('line-tools')).toMatchObject({
      path: '/tools/line-tools',
      category: 'text',
      group: 'List',
      aliases: expect.arrayContaining(['line sort', 'dedupe lines']),
      order: 10,
      status: 'active',
    })
  })

  it('registers list randomization in the list text group', () => {
    expect(getToolById('list-random')).toMatchObject({
      path: '/tools/list-random',
      category: 'text',
      group: 'List',
      aliases: expect.arrayContaining(['shuffle list', 'random sample']),
      order: 20,
      status: 'active',
    })
  })

  it('registers delimiter conversion in the list text group', () => {
    expect(getToolById('delimiter-convert')).toMatchObject({
      path: '/tools/delimiter-convert',
      category: 'text',
      group: 'List',
      aliases: expect.arrayContaining(['delimiter converter', 'list separator']),
      order: 30,
      status: 'active',
    })
  })

  it('registers string escaping in the string escape text group', () => {
    expect(getToolById('string-escape')).toMatchObject({
      path: '/tools/string-escape',
      category: 'text',
      group: 'String Escape',
      aliases: expect.arrayContaining(['string escape', 'json escape']),
      order: 10,
      status: 'active',
    })
  })

  it('registers slug generation in the text transform group', () => {
    expect(getToolById('slug')).toMatchObject({
      path: '/tools/slug',
      category: 'text',
      group: 'Text Transform',
      aliases: expect.arrayContaining(['slug generator', 'url slug']),
      order: 40,
      status: 'active',
    })
  })

  it('registers pinyin conversion in the text transform group', () => {
    expect(getToolById('pinyin')).toMatchObject({
      path: '/tools/pinyin',
      category: 'text',
      group: 'Text Transform',
      aliases: expect.arrayContaining(['chinese pinyin', 'hanzi pinyin']),
      order: 50,
      status: 'active',
    })
  })

  it('registers entity extraction in the extractor text group', () => {
    expect(getToolById('extractor')).toMatchObject({
      path: '/tools/extractor',
      category: 'text',
      group: 'Extractor',
      aliases: expect.arrayContaining(['extract urls', 'email extractor']),
      order: 10,
      status: 'active',
    })
  })

  it('registers template replacement in the text transform group', () => {
    expect(getToolById('template-replace')).toMatchObject({
      path: '/tools/template-replace',
      category: 'text',
      group: 'Text Transform',
      aliases: expect.arrayContaining(['template replace', 'variable replacement']),
      order: 60,
      status: 'active',
    })
  })

  it('registers URL parsing in the HTTP code group', () => {
    expect(getToolById('url-parser')).toMatchObject({
      path: '/tools/url-parser',
      category: 'code',
      group: 'HTTP',
      aliases: expect.arrayContaining(['url parse', 'uri parser']),
      order: 30,
      status: 'active',
    })
  })

  it('registers query editing in the HTTP code group', () => {
    expect(getToolById('query-editor')).toMatchObject({
      path: '/tools/query-editor',
      category: 'code',
      group: 'HTTP',
      aliases: expect.arrayContaining(['query params', 'url parameters']),
      order: 40,
      status: 'active',
    })
  })

  it('registers HTTP header parsing in the HTTP code group', () => {
    expect(getToolById('http-headers')).toMatchObject({
      path: '/tools/http-headers',
      category: 'code',
      group: 'HTTP',
      aliases: expect.arrayContaining(['header parser', 'http headers']),
      order: 50,
      status: 'active',
    })
  })

  it('registers cookie parsing in the HTTP code group', () => {
    expect(getToolById('cookie-parser')).toMatchObject({
      path: '/tools/cookie-parser',
      category: 'code',
      group: 'HTTP',
      aliases: expect.arrayContaining(['cookie parser', 'set-cookie']),
      order: 60,
      status: 'active',
    })
  })

  it('registers user agent parsing in the HTTP code group', () => {
    expect(getToolById('user-agent')).toMatchObject({
      path: '/tools/user-agent',
      category: 'code',
      group: 'HTTP',
      aliases: expect.arrayContaining(['user agent parser', 'ua parser']),
      order: 70,
      status: 'active',
    })
  })

  it('registers OAuth URL generation in the OAuth security group', () => {
    expect(getToolById('oauth-url')).toMatchObject({
      path: '/tools/oauth-url',
      category: 'security',
      group: 'OAuth',
      aliases: expect.arrayContaining(['oauth authorize url', 'authorization url']),
      order: 10,
      status: 'active',
    })
  })

  it('registers OpenAPI validation in the API schema code group', () => {
    expect(getToolById('openapi-viewer')).toMatchObject({
      path: '/tools/openapi-viewer',
      category: 'code',
      group: 'API Schema',
      aliases: expect.arrayContaining(['openapi validator', 'swagger viewer']),
      order: 10,
      status: 'active',
    })
  })

  it('registers GraphQL formatting in the API schema formatting group', () => {
    expect(getToolById('graphql-format')).toMatchObject({
      path: '/tools/graphql-format',
      category: 'format',
      group: 'API Schema',
      aliases: expect.arrayContaining(['graphql formatter', 'gql format']),
      order: 20,
      status: 'active',
    })
  })

  it('registers GraphQL variables checking in the API schema code group', () => {
    expect(getToolById('graphql-variables')).toMatchObject({
      path: '/tools/graphql-variables',
      category: 'code',
      group: 'API Schema',
      aliases: expect.arrayContaining(['graphql variables', 'gql variables']),
      order: 30,
      status: 'active',
    })
  })

  it('registers WebSocket echo in the HTTP code group', () => {
    expect(getToolById('websocket-echo')).toMatchObject({
      path: '/tools/websocket-echo',
      category: 'code',
      group: 'HTTP',
      aliases: expect.arrayContaining(['websocket client', 'ws echo']),
      order: 80,
      status: 'active',
    })
  })

  it('registers HAR viewing in the HTTP code group', () => {
    expect(getToolById('har-viewer')).toMatchObject({
      path: '/tools/har-viewer',
      category: 'code',
      group: 'HTTP',
      aliases: expect.arrayContaining(['har parser', 'network log']),
      order: 90,
      status: 'active',
    })
  })

  it('registers IP CIDR calculation in the network security group', () => {
    expect(getToolById('ip-cidr')).toMatchObject({
      path: '/tools/ip-cidr',
      category: 'security',
      group: 'Network',
      aliases: expect.arrayContaining(['cidr calculator', 'subnet calculator']),
      order: 10,
      status: 'active',
    })
  })

  it('registers IP conversion in the network security group', () => {
    expect(getToolById('ip-convert')).toMatchObject({
      path: '/tools/ip-convert',
      category: 'security',
      group: 'Network',
      aliases: expect.arrayContaining(['ipv4 converter', 'ipv6 mapped']),
      order: 20,
      status: 'active',
    })
  })

  it('registers MAC formatting in the network security group', () => {
    expect(getToolById('mac-address')).toMatchObject({
      path: '/tools/mac-address',
      category: 'security',
      group: 'Network',
      aliases: expect.arrayContaining(['mac formatter', 'oui lookup']),
      order: 30,
      status: 'active',
    })
  })

  it('registers DNS querying in the network code group', () => {
    expect(getToolById('dns-query')).toMatchObject({
      path: '/tools/dns-query',
      category: 'code',
      group: 'Network',
      aliases: expect.arrayContaining(['dns lookup', 'doh query']),
      order: 10,
      status: 'active',
    })
  })

  it('registers connection string parsing in the database code group', () => {
    expect(getToolById('connection-string')).toMatchObject({
      path: '/tools/connection-string',
      category: 'code',
      group: 'Database',
      aliases: expect.arrayContaining(['database url', 'connection string']),
      order: 45,
      status: 'active',
    })
  })

  it('registers SQL binding preview in the database code group', () => {
    expect(getToolById('sql-bind')).toMatchObject({
      path: '/tools/sql-bind',
      category: 'code',
      group: 'Database',
      aliases: expect.arrayContaining(['sql bind', 'sql parameters']),
      order: 55,
      status: 'active',
    })
  })

  it('registers Mongo ObjectId parsing in the database code group', () => {
    expect(getToolById('mongo-objectid')).toMatchObject({
      path: '/tools/mongo-objectid',
      category: 'code',
      group: 'Database',
      aliases: expect.arrayContaining(['objectid parser', 'mongo id']),
      order: 65,
      status: 'active',
    })
  })

  it('registers Redis command formatting in the database code group', () => {
    expect(getToolById('redis-command')).toMatchObject({
      path: '/tools/redis-command',
      category: 'code',
      group: 'Database',
      aliases: expect.arrayContaining(['redis resp', 'redis formatter']),
      order: 75,
      status: 'active',
    })
  })

  it('registers env JSON conversion in the config formatting group', () => {
    expect(getToolById('env-convert')).toMatchObject({
      path: '/tools/env-convert',
      category: 'format',
      group: 'Config',
      aliases: expect.arrayContaining(['.env parser', 'env to json']),
      order: 100,
      status: 'active',
    })
  })

  it('registers Docker Compose inspection in the DevOps code group', () => {
    expect(getToolById('docker-compose')).toMatchObject({
      path: '/tools/docker-compose',
      category: 'code',
      group: 'DevOps',
      aliases: expect.arrayContaining(['compose validator', 'docker compose']),
      order: 10,
      status: 'active',
    })
  })

  it('registers Kubernetes YAML inspection in the DevOps code group', () => {
    expect(getToolById('kubernetes-yaml')).toMatchObject({
      path: '/tools/kubernetes-yaml',
      category: 'code',
      group: 'DevOps',
      aliases: expect.arrayContaining(['k8s yaml', 'kubernetes validator']),
      order: 20,
      status: 'active',
    })
  })

  it('registers SemVer comparison in the release code group', () => {
    expect(getToolById('semver')).toMatchObject({
      path: '/tools/semver',
      category: 'code',
      group: 'Release',
      aliases: expect.arrayContaining(['semantic version', 'version range']),
      order: 10,
      status: 'active',
    })
  })
})
