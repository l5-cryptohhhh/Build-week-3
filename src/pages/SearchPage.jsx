import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Form from 'react-bootstrap/Form'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import Button from 'react-bootstrap/Button'
import EmptyState from '../components/common/EmptyState'
import RowSkeleton from '../components/common/RowSkeleton'
import PostCard from '../components/posts/PostCard'
import PostCardSkeleton from '../components/posts/PostCardSkeleton'
import UserResultItem from '../components/search/UserResultItem'
import useDebounce from '../hooks/useDebounce'
import {
  searchUsers,
  searchPosts,
  setSearchQuery,
  selectSearchQuery,
  selectSearchUsers,
  selectSearchPosts,
} from '../features/search/searchSlice'

export default function SearchPage() {
  const dispatch = useDispatch()
  const query = useSelector(selectSearchQuery)
  const users = useSelector(selectSearchUsers)
  const posts = useSelector(selectSearchPosts)
  const [input, setInput] = useState(query)
  const debouncedInput = useDebounce(input, 300)

  useEffect(() => {
    dispatch(setSearchQuery(debouncedInput))
    if (!debouncedInput.trim()) return
    dispatch(searchUsers({ q: debouncedInput, page: 1 }))
    dispatch(searchPosts({ q: debouncedInput, page: 1 }))
  }, [dispatch, debouncedInput])

  const hasQuery = query.trim().length > 0

  return (
    <div>
      <h1 className="h4 mb-3">Cerca</h1>
      <Form.Control
        size="lg"
        placeholder="Cerca utenti o post..."
        value={input}
        onChange={(event) => setInput(event.target.value)}
        autoFocus
        className="mb-4"
      />

      {!hasQuery ? (
        <EmptyState
          icon="bi-search"
          title="Inizia a digitare"
          description="Cerca utenti per nome o post per contenuto."
        />
      ) : (
        <Tabs defaultActiveKey="users" className="mb-3">
          <Tab eventKey="users" title={`Utenti (${users.totalCount})`}>
            {users.status === 'loading' && users.items.length === 0 ? (
              <>
                <RowSkeleton avatarSize={44} lines={2} />
                <RowSkeleton avatarSize={44} lines={2} />
              </>
            ) : users.items.length === 0 ? (
              <EmptyState icon="bi-people" title="Nessun utente trovato" />
            ) : (
              <div className="d-flex flex-column gap-1">
                {users.items.map((user) => (
                  <UserResultItem key={user.id} user={user} />
                ))}
                {users.items.length < users.totalCount && (
                  <div className="text-center mt-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      disabled={users.status === 'loading'}
                      onClick={() => dispatch(searchUsers({ q: query, page: users.page + 1 }))}
                    >
                      Carica altri utenti
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Tab>
          <Tab eventKey="posts" title={`Post (${posts.totalCount})`}>
            {posts.status === 'loading' && posts.items.length === 0 ? (
              <PostCardSkeleton />
            ) : posts.items.length === 0 ? (
              <EmptyState icon="bi-journal-text" title="Nessun post trovato" />
            ) : (
              <div>
                {posts.items.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
                {posts.items.length < posts.totalCount && (
                  <div className="text-center mb-3">
                    <Button
                      variant="outline-primary"
                      disabled={posts.status === 'loading'}
                      onClick={() => dispatch(searchPosts({ q: query, page: posts.page + 1 }))}
                    >
                      Carica altri post
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Tab>
        </Tabs>
      )}
    </div>
  )
}
