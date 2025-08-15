import React, { useEffect, useRef, useState } from "react"
import type { RootState } from "@/redux/store"
import { useDispatch, useSelector } from "react-redux"
import { setBreadcrumb } from "@/redux/breadcrumbSlice"
import { LuBot } from "react-icons/lu"
import { RiSendPlaneLine } from "react-icons/ri"
import ReactMarkdown from 'react-markdown'
import { Pulsar } from 'ldrs/react'
import 'ldrs/react/Pulsar.css'

type AiChat = {
  id: number,
  message: string,
}

const aiChat: AiChat[] = [
  {
    id: 0,
    message: "Hail, traveler. I'm here to guide your thoughts."
  },
]

const Assistant = () => {
  const [convo, setConvo] = useState<AiChat[]>(() => {
    try {
      const storedConvo = localStorage.getItem('skald_ai_chat')

      if (storedConvo) {
        const parsedConvo = JSON.parse(storedConvo);
        if (Array.isArray(parsedConvo) && parsedConvo.length > 0) {
          return parsedConvo;
        }
      }
      return aiChat

    } catch (err) {
      console.error(err)
      return aiChat;
    }
  })
  const [prompt, setPrompt] = useState("")
  const [responseLoading, setResponseLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  console.log(convo)

  const { tasks } = useSelector((store: RootState) => store.tasksStore)
  const { notes } = useSelector((store: RootState) => store.notesStore)
  const { user } = useSelector((store: RootState) => store.userStore)
  const { isDark } = useSelector((store: RootState) => store.themeStore)

  const tasksSummary = tasks.map(
    (task, i) => `${i + 1}. ${task.title} [${task.status}]`
  ).join('\n')

  const notesSummary = notes.map(
    (note, i) => `${i + 1}. ${note.title}: ${note.description?.slice(0, 30) ?? ""}...`
  ).join('\n')

  const dispatch = useDispatch()

  useEffect(() => {
    localStorage.setItem('skald_ai_chat', JSON.stringify(convo))
  }, [convo])

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }

  const aiResponse = async (userMessage: string) => {
    setResponseLoading(true)

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `You are the Skald Assistant, an opinionated, helpful, and context-aware AI built into the Skald productivity web application for users like ${user?.displayName}. Your primary role is to guide users in organizing their workflow, managing their daily tasks, and capturing notes efficiently using Skald’s robust feature set. Skald enables users to create, edit, delete, and categorize tasks—including tasks such as ${tasksSummary}—assign statuses like pending, in-progress, done, or blocked, and set priorities to highlight what matters most. Users can visualize their productivity with interactive charts, a heatmap, and a weekly calendar, and can organize tasks into custom lists for better clarity. The notes feature allows users to create, edit, delete, and view notes—including notes such as ${notesSummary}—with support for both text and image attachments, all timestamped for easy reference and organization. Authentication is handled securely via Google Sign-In with Firebase, ensuring all user data is synced and protected using the user’s Firebase UID. The user interface is modern, responsive, and visually appealing, crafted with Tailwind CSS, Framer Motion for smooth animations, and Recharts for insightful data visualization, all structured into modular React components for seamless navigation and usability. State management is handled globally with Redux Toolkit, supporting efficient and reliable updates for tasks, notes, user data, theming, and more. Skald supports both dark and light themes, allowing users to personalize their experience. As the Skald Assistant, you must be opinionated and proactive in your guidance, offering clear, actionable advice and suggestions. You are permitted to slightly deviate from Skald’s strict feature set if it helps the user achieve their productivity goals, but you must never discuss or speculate about features or integrations that are not implemented in Skald. Always keep your responses focused, practical, and tailored to ${user?.displayName}, referencing their current tasks and notes where relevant. Your purpose is to empower users to get the most out of Skald, streamline their workflow, and foster productive habits, while maintaining a friendly and knowledgeable tone at all times.`
                }
              ]
            },
            {
              role: "user",
              parts: [{ text: userMessage }]
            }
          ]
        }),
      }
    )
    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text
    setResponseLoading(false)
    setConvo(prev => [...prev, { id: prev.length, message: reply }])
  }

  const handlePrompt = (e: React.KeyboardEvent | React.MouseEvent) => {
    e.preventDefault()
    const textarea = textareaRef.current
    setConvo(prev => [...prev, { id: prev.length, message: prompt }])
    aiResponse(prompt)

    if (textarea) {
      textarea.style.height = "21px"
    }
    setPrompt('')
  }

  useEffect(() => {
    dispatch(setBreadcrumb("Assistant"))
  }, [dispatch])

  return (
    <div className={`relative col-span-1 row-span-1 grid grid-cols-[1fr] grid-rows-[1fr] ${isDark ? "bg-white/2 border-white/6" : "bg-neutral-200 border-black/6"} backdrop-blur-md border rounded-md shadow-lg p-[24px] overflow-y-auto mt-4`}>
      <div className="w-full overflow-y-auto col-span-1 row-span-1">
        <div className="pb-[50px]">
          {convo.map(c => (
            c.id % 2 == 0
              ? (
                <div
                  key={c.id}
                  className="w-full max-w-[720px] grid grid-cols-[52px_1fr] pl-[18px] ai-text"
                >
                  <LuBot className="text-[22px] bg-white/8 text-white size-auto p-[8px] rounded-3xl" />

                  <p className="w-full text-slate-200 pt-[6px]">
                    <ReactMarkdown>
                      {c.message}
                    </ReactMarkdown>
                  </p>
                </div>
              )
              : (
                <div
                  key={c.id}
                  className="ml-auto flex justify-end w-full max-w-[720px] pr-[18px] my-[16px]"
                >
                  <div
                    className="bg-white/5 p-3 max-w-full"
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
                    color="white"
                  />
                </div>
              ) : null
          }
        </div>
      </div>

      <div
        className="sticky bottom-0 m-auto grid grid-rows-[1fr_32px] gap-[12px] w-full max-w-[690px] bg-white/6 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg px-4 py-3"
      >
        <textarea
          ref={textareaRef}
          onInput={handleInput}
          className="text-white resize-none outline-none w-full bg-transparent  text-[14px]"
          placeholder="Ask anything"
          rows={1}
          onChange={e => setPrompt(e.currentTarget.value)}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault()
              handlePrompt(e)
            }
          }}
          value={prompt}
        >
        </textarea>

        <button
          className="text-[16px] text-[#0f111a] bg-white size-auto p-[8px] rounded-2xl ml-auto cursor-pointer"
          type="submit"
          onClick={handlePrompt}
        >
          <RiSendPlaneLine />
        </button>
      </div>
    </div>
  )
}

export default Assistant
