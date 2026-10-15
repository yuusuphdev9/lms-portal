/**
 * Minimal markdown-lite renderer for article lesson content: `## `/`### ` headings,
 * `**bold**` inline spans, and blank-line-separated paragraphs. Our mock content never
 * needs more than this, so a full markdown dependency isn't worth pulling in.
 */
export function LessonContent({ content }: { content: string }) {
  const blocks = content.split(/\n\n+/)
  return (
    <div className="flex flex-col gap-3">
      {blocks.map((block, i) => {
        if (block.startsWith('### ')) {
          return (
            <h4 key={i} className="font-heading text-base font-semibold">
              {block.slice(4)}
            </h4>
          )
        }
        if (block.startsWith('## ')) {
          return (
            <h3 key={i} className="font-heading text-lg font-semibold">
              {block.slice(3)}
            </h3>
          )
        }
        return (
          <p key={i} className="text-sm leading-relaxed text-foreground/90">
            {renderInline(block)}
          </p>
        )
      })}
    </div>
  )
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    const match = /^\*\*([^*]+)\*\*$/.exec(part)
    return match ? <strong key={i}>{match[1]}</strong> : <span key={i}>{part}</span>
  })
}
