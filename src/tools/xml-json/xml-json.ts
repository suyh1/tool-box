import { parseJson } from '@/tools/json/json'
import { validateXml } from '@/tools/xml/xml'

type XmlJsonValue = string | Record<string, unknown> | XmlJsonValue[]

function parseJsonOrThrow(input: string) {
  const result = parseJson(input)

  if (!result.ok) {
    throw new Error(result.message)
  }

  return result.value
}

function parseXmlOrThrow(input: string) {
  const result = validateXml(input)

  if (!result.ok) {
    throw new Error(result.message)
  }

  return new DOMParser().parseFromString(input, 'application/xml')
}

function addChild(target: Record<string, unknown>, key: string, value: XmlJsonValue) {
  if (!(key in target)) {
    target[key] = value
    return
  }

  const current = target[key]

  target[key] = Array.isArray(current) ? [...current, value] : [current, value]
}

function elementToJson(element: Element): XmlJsonValue {
  const result: Record<string, unknown> = {}

  for (const attribute of Array.from(element.attributes)) {
    result[`@${attribute.name}`] = attribute.value
  }

  for (const child of Array.from(element.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent?.trim()

      if (text) {
        result['#text'] = text
      }
      continue
    }

    if (child.nodeType === Node.ELEMENT_NODE) {
      const childElement = child as Element
      addChild(result, childElement.tagName, elementToJson(childElement))
    }
  }

  const keys = Object.keys(result)

  if (keys.length === 1 && keys[0] === '#text') {
    return result['#text'] as string
  }

  if (keys.length === 0) {
    return ''
  }

  return result
}

export function xmlToJson(input: string) {
  const document = parseXmlOrThrow(input)
  const root = document.documentElement

  return {
    [root.tagName]: elementToJson(root),
  }
}

export function xmlToJsonString(input: string) {
  return JSON.stringify(xmlToJson(input), null, 2)
}

function escapeXml(value: unknown) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderElement(name: string, value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((item) => renderElement(name, item)).join('')
  }

  if (!value || typeof value !== 'object') {
    return `<${name}>${escapeXml(value ?? '')}</${name}>`
  }

  const record = value as Record<string, unknown>
  const attributes = Object.entries(record)
    .filter(([key]) => key.startsWith('@'))
    .map(([key, attributeValue]) => ` ${key.slice(1)}="${escapeXml(attributeValue)}"`)
    .join('')
  const text = record['#text'] === undefined ? '' : escapeXml(record['#text'])
  const children = Object.entries(record)
    .filter(([key]) => !key.startsWith('@') && key !== '#text')
    .map(([key, childValue]) => renderElement(key, childValue))
    .join('')

  return `<${name}${attributes}>${text}${children}</${name}>`
}

export function jsonToXml(input: string) {
  const value = parseJsonOrThrow(input)

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('JSON 必须是包含单个根元素的对象')
  }

  const entries = Object.entries(value)

  if (entries.length !== 1) {
    throw new Error('JSON 必须只有一个根元素')
  }

  return renderElement(entries[0][0], entries[0][1])
}
