import { validateXml } from '@/tools/xml/xml'

export interface XPathMatch {
  kind: 'attribute' | 'element' | 'text'
  value: string
}

export interface XPathResultData {
  matches: XPathMatch[]
  output: string
}

function parseXmlOrThrow(input: string) {
  const result = validateXml(input)

  if (!result.ok) {
    throw new Error(result.message)
  }

  return new DOMParser().parseFromString(input, 'application/xml')
}

function serializeNode(node: Node) {
  if (node.nodeType === Node.ELEMENT_NODE) {
    return new XMLSerializer().serializeToString(node)
  }

  return node.textContent ?? ''
}

function getNodeKind(node: Node): XPathMatch['kind'] {
  if (node.nodeType === Node.ATTRIBUTE_NODE) {
    return 'attribute'
  }

  if (node.nodeType === Node.TEXT_NODE) {
    return 'text'
  }

  return 'element'
}

export function queryXPath(input: string, expression: string): XPathResultData {
  const document = parseXmlOrThrow(input)
  const result = document.evaluate(
    expression,
    document,
    null,
    XPathResult.ORDERED_NODE_ITERATOR_TYPE,
    null,
  )
  const matches: XPathMatch[] = []
  let node = result.iterateNext()

  while (node) {
    matches.push({
      kind: getNodeKind(node),
      value: serializeNode(node),
    })
    node = result.iterateNext()
  }

  return {
    matches,
    output: JSON.stringify(matches, null, 2),
  }
}
