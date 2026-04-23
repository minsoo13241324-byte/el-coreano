'use client'

import { useState, useTransition } from 'react'
import { Comment } from '@/types'
import { timeAgo } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { CommentForm } from './CommentForm'
import { deleteComment, updateComment } from '@/actions/comments'
import { MessageSquare, Trash2, Pencil } from 'lucide-react'

interface Props {
  comment: Comment
  postId: string
  currentUserId: string | null
  isAdmin: boolean
  depth?: number
}

export function CommentItem({ comment, postId, currentUserId, isAdmin, depth = 0 }: Props) {
  const [replying, setReplying]    = useState(false)
  const [editing, setEditing]      = useState(false)
  const [editText, setEditText]    = useState(comment.content)
  const [, startTransition]        = useTransition()
  const [localDeleted, setDeleted] = useState(false)

  const isOwner   = currentUserId === comment.user_id
  const canEdit   = isOwner && !comment.is_deleted
  const canDelete = (isOwner || isAdmin) && !comment.is_deleted

  if (localDeleted) return null

  const handleDelete = () => {
    if (!confirm('¿Eliminar este comentario?')) return
    startTransition(async () => {
      await deleteComment(comment.id, postId)
      setDeleted(true)
    })
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const fd = new FormData()
    fd.set('content', editText)
    fd.set('post_id', postId)
    startTransition(async () => {
      await updateComment(comment.id, fd)
      setEditing(false)
    })
  }

  return (
    <div className={`flex gap-3 ${depth > 0 ? 'ml-8 mt-3' : 'mt-4'}`}>
      {/* Thread line for replies */}
      {depth > 0 && (
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="w-px flex-1 bg-slate-200 rounded-full mt-1" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        {/* Avatar + meta */}
        <div className="flex items-center gap-2 mb-2">
          <Avatar
            username={comment.profiles?.username ?? '?'}
            avatarUrl={(comment.profiles as any)?.avatar_url ?? null}
            size="sm"
          />
          <span className="text-sm font-semibold text-slate-800">
            {comment.profiles?.username ?? 'usuario'}
          </span>
          <span className="text-xs text-slate-400">{timeAgo(comment.created_at)}</span>
        </div>

        {/* Content */}
        {editing ? (
          <form onSubmit={handleEditSubmit} className="space-y-2">
            <textarea
              value={editText}
              onChange={e => setEditText(e.target.value)}
              rows={3}
              className="input-base resize-y"
            />
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>
                Cancelar
              </Button>
              <Button type="submit" size="sm">Guardar</Button>
            </div>
          </form>
        ) : (
          <p className={`text-sm leading-relaxed ${
            comment.is_deleted
              ? 'italic text-slate-400'
              : 'text-slate-700'
          }`}>
            {comment.content}
          </p>
        )}

        {/* Action buttons */}
        {!comment.is_deleted && !editing && (
          <div className="flex items-center gap-1 mt-2">
            {currentUserId && (
              <button
                onClick={() => setReplying(r => !r)}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <MessageSquare size={11} />
                Responder
              </button>
            )}
            {canEdit && (
              <button
                onClick={() => setEditing(e => !e)}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Pencil size={11} />
                Editar
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 size={11} />
                Eliminar
              </button>
            )}
          </div>
        )}

        {/* Reply form */}
        {replying && (
          <div className="mt-3">
            <CommentForm
              postId={postId}
              parentId={comment.id}
              onDone={() => setReplying(false)}
              placeholder={`Responder a ${comment.profiles?.username}…`}
            />
          </div>
        )}

        {/* Nested replies */}
        {comment.replies?.map(reply => (
          <CommentItem
            key={reply.id}
            comment={reply}
            postId={postId}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
            depth={depth + 1}
          />
        ))}
      </div>
    </div>
  )
}
