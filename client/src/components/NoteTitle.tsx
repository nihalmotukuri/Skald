import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface NoteTitleProps {
  title: string
}

const NoteTitle = ({ title }: NoteTitleProps) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{ p: ({ children }) => <>{children}</> }}
  >
    {title || 'Untitled note'}
  </ReactMarkdown>
)

export default NoteTitle
