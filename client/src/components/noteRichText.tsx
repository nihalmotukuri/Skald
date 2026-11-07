import { renderToStaticMarkup } from 'react-dom/server'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export const stripInlineNoteImages = (markdown: string) => markdown
  .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
  .replace(/\n{3,}/g, '\n\n')
  .trim()

export const markdownToEditorHtml = (markdown: string, singleLine = false) => renderToStaticMarkup(
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      img: () => null,
      ...(singleLine ? { p: ({ children }) => <>{children}</> } : {}),
    }}
  >
    {singleLine ? markdown : stripInlineNoteImages(markdown)}
  </ReactMarkdown>
)

const serializeNode = (node: Node, inList = false): string => {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? ''
  if (!(node instanceof HTMLElement)) return ''

  const content = [...node.childNodes].map((child) => serializeNode(child, inList)).join('')
  switch (node.tagName) {
    case 'BR': return '\n'
    case 'B':
    case 'STRONG': return `**${content}**`
    case 'I':
    case 'EM': return `*${content}*`
    case 'S':
    case 'STRIKE':
    case 'DEL': return `~~${content}~~`
    case 'CODE': return `\`${content}\``
    case 'PRE': return `\`\`\`\n${content.trim()}\n\`\`\`\n\n`
    case 'H1': return `# ${content.trim()}\n\n`
    case 'H2': return `## ${content.trim()}\n\n`
    case 'H3': return `### ${content.trim()}\n\n`
    case 'BLOCKQUOTE': return `${content.trim().split('\n').map((line) => `> ${line}`).join('\n')}\n\n`
    case 'UL':
    case 'OL': {
      const items = [...node.children]
        .filter((child) => child.tagName === 'LI')
        .map((child, index) => {
          const item = [...child.childNodes].map((part) => serializeNode(part, true)).join('').trim()
          const taskItem = child.hasAttribute('data-task-item') || child.classList.contains('task-list-item')
          const checkbox = child.querySelector<HTMLInputElement>('input[type="checkbox"]')
          const taskPrefix = taskItem ? `[${checkbox?.checked ? 'x' : ' '}] ` : ''
          return `${node.tagName === 'OL' ? `${index + 1}.` : '-'} ${taskPrefix}${item}`
        })
      return `${items.join('\n')}\n\n`
    }
    case 'LI': return content
    case 'P': return inList ? content : `${content}\n\n`
    case 'DIV': return inList ? content : `${content}\n`
    default: return content
  }
}

export const editorHtmlToMarkdown = (element: HTMLElement, singleLine = false) => {
  const markdown = [...element.childNodes].map((node) => serializeNode(node)).join('')
  return (singleLine ? markdown.replace(/[\r\n]+/g, ' ') : markdown)
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
