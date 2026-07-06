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
    expect(getToolById('yaml-json')?.title).toBe('YAML / JSON 转换')
    expect(getToolById('cron')?.title).toBe('Cron 表达式解析')
    expect(getToolById('csv-json')?.title).toBe('CSV / JSON 转换')
    expect(getToolById('csv-sql')?.title).toBe('CSV / SQL INSERT 生成')
    expect(getToolById('csv-table')?.title).toBe('CSV 表格查看器')
    expect(getToolById('css')?.title).toBe('CSS 格式化')
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
})
