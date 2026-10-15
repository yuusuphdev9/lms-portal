import { Check, X } from 'lucide-react'
import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { MatchingAnswer, MatchingQuestion, Question, QuestionAnswer } from '@/types'

interface QuestionFieldProps {
  question: Question
  answer: QuestionAnswer | undefined
  onChange: (answer: QuestionAnswer) => void
  /** Set once the quiz has been submitted — switches the field to a read-only, graded view. */
  isCorrect?: boolean | undefined
  disabled?: boolean | undefined
  /** True once the student has tried to submit without answering this question. */
  showRequiredError?: boolean | undefined
}

export function QuestionField({
  question,
  answer,
  onChange,
  isCorrect,
  disabled,
  showRequiredError,
}: QuestionFieldProps) {
  const graded = isCorrect !== undefined

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm',
        showRequiredError ? 'border-destructive' : 'border-border',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-medium leading-snug">{question.prompt}</p>
        {graded && (
          <span
            className={cn(
              'flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
              isCorrect
                ? 'bg-success/15 text-success'
                : 'bg-destructive/15 text-destructive',
            )}
          >
            {isCorrect ? <Check className="size-3.5" /> : <X className="size-3.5" />}
            {isCorrect ? 'Correct' : 'Incorrect'}
          </span>
        )}
      </div>

      <QuestionInput question={question} answer={answer} onChange={onChange} disabled={disabled} />

      {showRequiredError && (
        <p className="text-xs font-medium text-destructive">Answer this question before submitting.</p>
      )}

      {graded && !isCorrect && question.explanation && (
        <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
          {question.explanation}
        </p>
      )}
    </div>
  )
}

function QuestionInput({
  question,
  answer,
  onChange,
  disabled,
}: Omit<QuestionFieldProps, 'isCorrect'>) {
  switch (question.type) {
    case 'single-choice':
      return (
        <div className="flex flex-col gap-2">
          {question.options.map((option) => (
            <label
              key={option.id}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border px-3 py-2.5 text-sm has-[:checked]:border-primary has-[:checked]:bg-accent"
            >
              <input
                type="radio"
                name={question.id}
                className="accent-[var(--primary)]"
                disabled={disabled}
                checked={answer?.type === 'single-choice' && answer.selectedOptionId === option.id}
                onChange={() => { onChange({ questionId: question.id, type: 'single-choice', selectedOptionId: option.id }); }
                }
              />
              {option.label}
            </label>
          ))}
        </div>
      )

    case 'multiple-choice': {
      const selected = answer?.type === 'multiple-choice' ? answer.selectedOptionIds : []
      return (
        <div className="flex flex-col gap-2">
          {question.options.map((option) => {
            const checked = selected.includes(option.id)
            return (
              <label
                key={option.id}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border px-3 py-2.5 text-sm has-[:checked]:border-primary has-[:checked]:bg-accent"
              >
                <input
                  type="checkbox"
                  disabled={disabled}
                  checked={checked}
                  onChange={() => {
                    const next = checked
                      ? selected.filter((id) => id !== option.id)
                      : [...selected, option.id]
                    onChange({ questionId: question.id, type: 'multiple-choice', selectedOptionIds: next })
                  }}
                />
                {option.label}
              </label>
            )
          })}
        </div>
      )
    }

    case 'true-false': {
      const value = answer?.type === 'true-false' ? answer.value : undefined
      return (
        <div className="flex gap-2">
          {[true, false].map((option) => (
            <button
              key={String(option)}
              type="button"
              disabled={disabled}
              onClick={() => { onChange({ questionId: question.id, type: 'true-false', value: option }); }}
              className={cn(
                'flex-1 rounded-lg border border-border px-3 py-2.5 text-sm font-medium',
                value === option && 'border-primary bg-accent',
              )}
            >
              {option ? 'True' : 'False'}
            </button>
          ))}
        </div>
      )
    }

    case 'short-text':
      return (
        <input
          type="text"
          disabled={disabled}
          value={answer?.type === 'short-text' ? answer.value : ''}
          onChange={(e) => { onChange({ questionId: question.id, type: 'short-text', value: e.target.value }); }
          }
          placeholder="Your answer"
          className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
        />
      )

    case 'long-text':
      return (
        <textarea
          disabled={disabled}
          value={answer?.type === 'long-text' ? answer.value : ''}
          onChange={(e) => { onChange({ questionId: question.id, type: 'long-text', value: e.target.value }); }}
          placeholder="Write your response"
          rows={4}
          className="resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
        />
      )

    case 'numeric':
      return (
        <input
          type="number"
          disabled={disabled}
          value={answer?.type === 'numeric' ? answer.value : ''}
          onChange={(e) => { onChange({ questionId: question.id, type: 'numeric', value: Number(e.target.value) }); }
          }
          placeholder="0"
          className="w-32 rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-mono outline-none focus:border-primary"
        />
      )

    case 'matching':
      return (
        <MatchingInput question={question} answer={answer} onChange={onChange} disabled={disabled} />
      )

    case 'ordering': {
      const order =
        answer?.type === 'ordering' ? answer.order : question.items.map((item) => item.id)
      const itemById = new Map(question.items.map((item) => [item.id, item]))
      const move = (index: number, direction: -1 | 1) => {
        const next = [...order]
        const target = index + direction
        if (target < 0 || target >= next.length) return
        const [moved] = next.splice(index, 1)
        if (moved) next.splice(target, 0, moved)
        onChange({ questionId: question.id, type: 'ordering', order: next })
      }
      return (
        <ol className="flex flex-col gap-2">
          {order.map((itemId, index) => (
            <li
              key={itemId}
              className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-sm"
            >
              <span className="font-mono text-xs text-muted-foreground">{index + 1}</span>
              <span className="flex-1">{itemById.get(itemId)?.label}</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={disabled === true || index === 0}
                  onClick={() => {
                    move(index, -1)
                  }}
                  className="rounded-md border border-border px-2 py-1 text-xs disabled:opacity-40"
                >
                  Up
                </button>
                <button
                  type="button"
                  disabled={disabled === true || index === order.length - 1}
                  onClick={() => {
                    move(index, 1)
                  }}
                  className="rounded-md border border-border px-2 py-1 text-xs disabled:opacity-40"
                >
                  Down
                </button>
              </div>
            </li>
          ))}
        </ol>
      )
    }

    case 'fill-in-blank': {
      const values = answer?.type === 'fill-in-blank' ? answer.values : {}
      const segments = question.template.split(/(\{\{\w[\w-]*\}\})/g)
      return (
        <p className="flex flex-wrap items-center gap-1.5 text-sm leading-8">
          {segments.map((segment, i) => {
            const match = /^\{\{(\w[\w-]*)\}\}$/.exec(segment)
            if (!match) return <span key={i}>{segment}</span>
            const slotId = match[1]
            if (!slotId) return <span key={i}>{segment}</span>
            return (
              <input
                key={i}
                type="text"
                disabled={disabled}
                value={values[slotId] ?? ''}
                onChange={(e) => { onChange({
                    questionId: question.id,
                    type: 'fill-in-blank',
                    values: { ...values, [slotId]: e.target.value },
                  }); }
                }
                className="w-32 rounded-md border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
              />
            )
          })}
        </p>
      )
    }
  }
}

function MatchingInput({
  question,
  answer,
  onChange,
  disabled,
}: {
  question: MatchingQuestion
  answer: QuestionAnswer | undefined
  onChange: (answer: QuestionAnswer) => void
  disabled?: boolean | undefined
}) {
  const shuffledRight = useMemo(() => shuffle(question.pairs.map((p) => p.right)), [question.pairs])
  const pairs: MatchingAnswer['pairs'] = answer?.type === 'matching' ? answer.pairs : {}

  return (
    <div className="flex flex-col gap-2">
      {question.pairs.map((pair) => (
        <div key={pair.id} className="flex items-center gap-3">
          <span className="w-40 shrink-0 text-sm">{pair.left}</span>
          <select
            disabled={disabled}
            value={pairs[pair.id] ?? ''}
            onChange={(e) => { onChange({
                questionId: question.id,
                type: 'matching',
                pairs: { ...pairs, [pair.id]: e.target.value },
              }); }
            }
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">Select a match…</option>
            {shuffledRight.map((right) => (
              <option key={right} value={right}>
                {right}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  )
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const a = next[i]
    const b = next[j]
    if (a === undefined || b === undefined) continue
    next[i] = b
    next[j] = a
  }
  return next
}
