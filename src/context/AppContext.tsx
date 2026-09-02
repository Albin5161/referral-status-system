import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  ReferralRequest,
  ReferralStatus,
  Role,
  StatusUpdate,
  ThreadMessage,
} from '../types'
import { ME, RECIPIENT, SEED_MESSAGES } from '../sampleData'
import { load, save, uid } from '../storage'

// An in-app notification (PRD §4 item 6) raised when the referrer posts an update.
export interface AppNotification {
  id: string
  referralRequestId: string
  status: ReferralStatus
  createdAt: string
  read: boolean
}

interface CreateRequestInput {
  recipientId: string
  jobPostingId: string
  jobTitleSnapshot: string
  companySnapshot: string
  initialMessage: string
}

interface AppState {
  role: Role
  setRole: (r: Role) => void

  members: { me: typeof ME; recipient: typeof RECIPIENT }

  referralRequests: ReferralRequest[]
  statusUpdates: StatusUpdate[]
  threadMessages: ThreadMessage[]

  notifications: AppNotification[]
  dismissNotification: (id: string) => void
  markNotificationRead: (id: string) => void

  sendMessage: (peerId: string, body: string) => void

  // Pessimistic creation — resolves only after a simulated round-trip (PRD §5.7).
  createReferralRequest: (
    input: CreateRequestInput,
    opts?: { simulateFailure?: boolean },
  ) => Promise<ReferralRequest>

  postStatusUpdate: (
    referralRequestId: string,
    newStatus: ReferralStatus,
    changedBy: string,
    note?: string,
  ) => void

  resetPrototype: () => void
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(() => load<Role>('role', 'requester'))
  const [referralRequests, setReferralRequests] = useState<ReferralRequest[]>(() =>
    load<ReferralRequest[]>('referralRequests', []),
  )
  const [statusUpdates, setStatusUpdates] = useState<StatusUpdate[]>(() =>
    load<StatusUpdate[]>('statusUpdates', []),
  )
  const [threadMessages, setThreadMessages] = useState<ThreadMessage[]>(() =>
    // Migrate any pre-existing messages saved before peerId existed → scope them
    // to the canonical Alex Johnson conversation.
    load<ThreadMessage[]>('threadMessages', SEED_MESSAGES).map((m) => ({
      ...m,
      peerId: m.peerId ?? RECIPIENT.id,
    })),
  )
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    load<AppNotification[]>('notifications', []),
  )

  useEffect(() => save('role', role), [role])
  useEffect(() => save('referralRequests', referralRequests), [referralRequests])
  useEffect(() => save('statusUpdates', statusUpdates), [statusUpdates])
  useEffect(() => save('threadMessages', threadMessages), [threadMessages])
  useEffect(() => save('notifications', notifications), [notifications])

  const setRole = useCallback((r: Role) => setRoleState(r), [])

  const sendMessage = useCallback(
    (peerId: string, body: string) => {
      const trimmed = body.trim()
      if (!trimmed) return
      // In a 1:1 conversation between ME and the peer, the requester speaks as ME
      // and the referrer speaks as the peer.
      const senderId = role === 'requester' ? ME.id : peerId
      setThreadMessages((prev) => [
        ...prev,
        {
          id: uid('m'),
          senderId,
          peerId,
          body: trimmed,
          sentAt: new Date().toISOString(),
        },
      ])
    },
    [role],
  )

  const createReferralRequest = useCallback(
    (input: CreateRequestInput, opts?: { simulateFailure?: boolean }) =>
      new Promise<ReferralRequest>((resolve, reject) => {
        // Pessimistic: the object does not exist until this resolves (PRD §5.7, §11).
        window.setTimeout(() => {
          if (opts?.simulateFailure) {
            reject(new Error("Couldn't create your Referral Request."))
            return
          }
          const now = new Date().toISOString()
          const request: ReferralRequest = {
            id: uid('req'),
            requesterId: ME.id,
            recipientId: input.recipientId,
            jobPostingId: input.jobPostingId,
            jobTitleSnapshot: input.jobTitleSnapshot,
            companySnapshot: input.companySnapshot,
            initialMessage: input.initialMessage,
            createdAt: now,
          }
          // Auto-created initial Pending update, actor "system" (PRD §2).
          const initialUpdate: StatusUpdate = {
            id: uid('su'),
            referralRequestId: request.id,
            newStatus: 'Pending',
            changedBy: 'system',
            changedAt: now,
          }
          setReferralRequests((prev) => [...prev, request])
          setStatusUpdates((prev) => [...prev, initialUpdate])
          resolve(request)
        }, 1100)
      }),
    [],
  )

  const postStatusUpdate = useCallback(
    (
      referralRequestId: string,
      newStatus: ReferralStatus,
      changedBy: string,
      note?: string,
    ) => {
      const now = new Date().toISOString()
      const update: StatusUpdate = {
        id: uid('su'),
        referralRequestId,
        newStatus,
        changedBy,
        changedAt: now,
        note: note?.trim() ? note.trim() : undefined,
      }
      setStatusUpdates((prev) => [...prev, update])

      // Raise a requester-facing notification only for referrer-posted updates.
      // The requester's own Withdraw and the system's initial Pending do not notify.
      if (changedBy !== 'system' && changedBy !== ME.name) {
        setNotifications((prev) => [
          ...prev,
          {
            id: uid('ntf'),
            referralRequestId,
            status: newStatus,
            createdAt: now,
            read: false,
          },
        ])
      }
    },
    [],
  )

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    )
  }, [])

  const resetPrototype = useCallback(() => {
    setReferralRequests([])
    setStatusUpdates([])
    setThreadMessages(SEED_MESSAGES)
    setNotifications([])
    setRoleState('requester')
  }, [])

  const value = useMemo<AppState>(
    () => ({
      role,
      setRole,
      members: { me: ME, recipient: RECIPIENT },
      referralRequests,
      statusUpdates,
      threadMessages,
      notifications,
      dismissNotification,
      markNotificationRead,
      sendMessage,
      createReferralRequest,
      postStatusUpdate,
      resetPrototype,
    }),
    [
      role,
      setRole,
      referralRequests,
      statusUpdates,
      threadMessages,
      notifications,
      dismissNotification,
      markNotificationRead,
      sendMessage,
      createReferralRequest,
      postStatusUpdate,
      resetPrototype,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): AppState {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
