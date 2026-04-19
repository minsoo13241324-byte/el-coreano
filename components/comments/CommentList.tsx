import { Comment } from '@/types'
import { CommentItem } from './CommentItem'

interface Props {
  comments: Comment[]
  postId: string
  currentUserId: string | null
  isAdmin: boolean
}

function buildTree(comments: Comment[]): Comment[] {
  const map = new Map<string, Comment>()
  const roots: Comment[] = []

  comments.forEach(c => map.set(c.id, { ...c, replies: [] }))

  map.forEach(comment => {
    if (comment.parent_id && map.has(comment.parent_id)) {
      map.get(comment.parent_id)!.replies!.push(comment)
    } else {
      roots.push(comment)
    }
  })

  return roots
}

export function CommentList({ comments, postId, currentUserId, isAdmin }: Props) {
  const tree = buildTree(comments)

  if (tree.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-4 text-center">
        Sé el primero en comentar. 💬
      </p>
    )
  }

  return (
    <div className="divide-y divide-gray-100">
      {tree.map(comment => (
        <CommentItem
          key={comment.id}
          comment={comment}
          postId={postId}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  )
}
