import React, { useEffect, useRef, useState } from "react"
import { useAppStore } from '@/store/appStore'
import { supabase } from '@/lib/supabase'
import { LuBot } from "react-icons/lu"
import { RiSendPlaneLine } from "react-icons/ri"
import ReactMarkdown from 'react-markdown'
import { Pulsar } from 'ldrs/react'
import 'ldrs/react/Pulsar.css'

type AiChat = {
  id: string,
  role: 'user' | 'assistant',
  message: string,
}

const aiChat: AiChat[] = [
  {
    id: 'welcome',
    role: 'assistant',
    message: "Hail, traveler. I'm here to guide your thoughts."
  },
]

const loadConversation = (userId: string | undefined): AiChat[] => {
  if (!userId) return aiChat

  try {
    const storedConvo = localStorage.getItem(`skald_ai_chat:${userId}`)
    if (!storedConvo) return aiChat
    const parsedConvo: unknown = JSON.parse(storedConvo)
    if (!Array.isArray(parsedConvo)) return aiChat

    const messages = parsedConvo.flatMap((item: unknown, index): AiChat[] => {
      if (!item || typeof item !== 'object' || !('message' in item) || typeof item.message !== 'string') {
        return []
      }
      const id = 'id' in item && typeof item.id === 'string' ? item.id : `restored-${index}`
      const role = 'role' in item && (item.role === 'user' || item.role === 'assistant')
        ? item.role
        : 'id' in item && typeof item.id === 'number' && item.id % 2 === 1
          ? 'user'
          : 'assistant'
      return [{ id, role, message: item.message }]
    })
    return messages.length ? messages.slice(-100) : aiChat
  } catch (error) {
    console.error('Unable to restore Mr Groff conversation:', error)
    return aiChat
  }
}

const Assistant = () => {
  const [conversation, setConversation] = useState(() => ({
    userId: useAppStore.getState().user?.id,
    messages: loadConversation(useAppStore.getState().user?.id)
  }))
  const [prompt, setPrompt] = useState("")
  const [responseLoading, setResponseLoading] = useState(false)
  const [requestError, setRequestError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const user = useAppStore((state) => state.user)
  const isDark = useAppStore((state) => state.isDark)
  const setBreadcrumb = useAppStore((state) => state.setBreadcrumb)
  const convo = conversation.userId === user?.id ? conversation.messages : aiChat

  useEffect(() => {
    if (!user?.id) return
    setConversation({ userId: user.id, messages: loadConversation(user.id) })
    setRequestError(null)
    setResponseLoading(false)
  }, [user?.id])

  useEffect(() => {
    if (user?.id && conversation.userId === user.id) {
      localStorage.setItem(`skald_ai_chat:${user.id}`, JSON.stringify(conversation.messages))
    }
  }, [conversation, user?.id])

  useEffect(() => {
    const textarea = textareaRef.current
    textarea?.focus()
  })

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }

  const aiResponse = async (userMessage: string, previousMessages: AiChat[], userId: string) => {
    setResponseLoading(true)
    setRequestError(null)
    try {
      const apiUrl = import.meta.env.VITE_ASSISTANT_API_URL?.replace(/\/+$/, '')
      if (!apiUrl) throw new Error('Mr Groff is not configured. Set VITE_ASSISTANT_API_URL for the web app.')

      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      if (!session || session.user.id !== userId) throw new Error('Your session expired. Sign in again to continue.')

      const messages = [
        ...previousMessages
          .filter((message) => message.id !== 'welcome')
          .slice(-19)
          .map(({ role, message }) => ({ role, content: message })),
        { role: 'user' as const, content: userMessage }
      ]
      const res = await fetch(`${apiUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ messages })
      })
      const data: { detail?: unknown; reply?: unknown } = await res.json()
      if (!res.ok) {
        throw new Error(typeof data.detail === 'string' ? data.detail : 'Mr Groff could not respond. Please try again.')
      }
      if (typeof data.reply !== 'string' || !data.reply.trim()) {
        throw new Error('Mr Groff returned an empty response. Please try again.')
      }
      const reply = data.reply.trim()
      if (useAppStore.getState().user?.id === userId) {
        const assistantMessage: AiChat = { id: crypto.randomUUID(), role: 'assistant', message: reply }
        setConversation((current) => ({
          userId,
          messages: [
            ...(current.userId === userId ? current.messages : loadConversation(userId)),
            assistantMessage
          ].slice(-100)
        }))
      }
    } catch (error) {
      console.error('Mr Groff request failed:', error)
      if (useAppStore.getState().user?.id === userId) {
        setRequestError(error instanceof Error ? error.message : 'Mr Groff could not respond. Please try again.')
      }
    } finally {
      if (useAppStore.getState().user?.id === userId) setResponseLoading(false)
    }
  }

  const handlePrompt = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const message = prompt.trim()
    if (!message || responseLoading || !user?.id) return
    const previousMessages = convo
    const userMessage: AiChat = { id: crypto.randomUUID(), role: 'user', message }
    setConversation((current) => ({
      userId: user.id,
      messages: [
        ...(current.userId === user.id ? current.messages : previousMessages),
        userMessage
      ].slice(-100)
    }))
    void aiResponse(message, previousMessages, user.id)
    setPrompt('')
    if (textareaRef.current) textareaRef.current.style.height = "21px"
  }

  useEffect(() => {
    setBreadcrumb("Assistant")
  }, [setBreadcrumb])

  return (
    <div className={`relative col-span-1 row-span-1 grid grid-cols-[1fr] grid-rows-[1fr] ${isDark ? "bg-white/2 border-white/6" : "bg-white"} backdrop-blur-md border rounded-md shadow-xl p-[24px] overflow-y-auto mt-4`}>
      <div className="w-full overflow-y-auto col-span-1 row-span-1">
        <div className="pb-[100px]">
          {convo.map(c => (
            c.role === 'assistant'
              ? (
                <div
                  key={c.id}
                  className="w-full max-w-[720px] grid grid-cols-[52px_1fr] pl-[18px] ai-text"
                >
                  <LuBot className={`text-[22px] ${isDark ? "bg-white/8" : "bg-[#602bf8]"} text-white size-auto p-[8px] rounded-3xl`} />

                  <div className={`w-full pt-[6px] ${isDark ? "text-slate-200" : "text-blue-950"}`}>
                    <ReactMarkdown>
                      {c.message}
                    </ReactMarkdown>
                  </div>
                </div>
              )
              : (
                <div
                  key={c.id}
                  className="ml-auto flex justify-end w-full max-w-[720px] pr-[18px] my-[16px]"
                >
                  <div
                    className={`${isDark ? "bg-white/5" : "bg-[#602bf8] text-white"} px-3 py-2 max-w-full`}
                    style={{
                      borderRadius: "16px",
                      borderBottomRightRadius: "0"
                    }}
                  >
                    <p className="w-full">
                      {c.message}
                    </p>
                  </div>
                </div>
              )
          ))}

          {
            responseLoading
              ? (
                <div className="ml-[22px] mt-2">
                  <Pulsar
                    size="30"
                    speed="2.4"
                    color={isDark ? "white" : "#602bf8"}
                  />
                </div>
              ) : null
          }
        </div>
      </div>

      <form
        onSubmit={handlePrompt}
        className={`absolute bottom-[24px] right-0 left-0 m-auto grid grid-rows-[1fr_32px] gap-[12px] w-full max-w-[690px] border ${isDark ? "bg-white/6 border-white/10" : "bg-white/10 border-black/30"} backdrop-blur-md rounded-2xl shadow-lg px-4 py-3`}
      >
        {requestError && <p role="alert" className="text-sm text-red-400">{requestError}</p>}
        <textarea
          ref={textareaRef}
          onInput={handleInput}
          className={`${isDark ? "text-white" : "text-slate-800"} resize-none outline-none w-full bg-transparent  text-[14px]`}
          placeholder="Ask anything"
          rows={1}
          onChange={e => setPrompt(e.currentTarget.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              e.currentTarget.form?.requestSubmit()
            }
          }}
          value={prompt}
        >
        </textarea>

        <button
          className={`text-[16px] ${ isDark ? "bg-white text-[#0f111a]" : "bg-[#602bf8] text-white"} size-auto p-[8px] rounded-2xl ml-auto cursor-pointer`}
          type="submit"
          disabled={responseLoading || !prompt.trim()}
          aria-label="Send message"
        >
          <RiSendPlaneLine />
        </button>
      </form>
    </div>
  )
}

export default Assistant
