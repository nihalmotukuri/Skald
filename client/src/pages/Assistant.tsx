import React, { useEffect, useRef, useState } from "react"
import { useDispatch } from "react-redux"
import { setBreadcrumb } from "@/redux/breadcrumbSlice"
import { GoHubot } from "react-icons/go"
import { RiSendPlaneLine } from "react-icons/ri"

type AiChat = {
  id: number,
  message: string,
}

const aiChat: AiChat[] = [
  {
    id: 0,
    message: "Hail, traveler. Mr. Groff is here to guide your thoughts."
  },
]

const Assistant = () => {
  const [convo, setConvo] = useState(aiChat)
  const [prompt, setPrompt] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const dispatch = useDispatch()

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto"; // Reset height
      textarea.style.height = `${textarea.scrollHeight}px`; // Set to scroll height
    }
  }

  const aiResponse = async (userMessage: string) => {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAhpkdMRgrfC0ZPLzSVfiuyb6tROEiiuLo",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Skald is a productivity and task management web application built with React and TypeScript (using Vite), focused on helping users organize tasks and notes efficiently through a clean, responsive UI. The application features a comprehensive task system where users can create, categorize, and manage tasks, assign statuses (pending, in-progress, done, blocked), set priorities (Low/Medium/High), and track progress visually via charts, with onboarding tasks to assist new users. Notes functionality allows users to create, view, and organize notes with support for text and images, each note timestamped for easy tracking. The UI leverages Tailwind CSS for styling, framer-motion for animations, and recharts for data visualization, ensuring a modern and engaging user experience. Redux is used for state management, including navigation breadcrumbs. There’s also a planned Assistant module intended to provide in-app help and automation, though it’s currently a placeholder. The codebase is structured for extensibility and maintainability, with strong use of modular React components and best practices in linting and type safety. For an AI assistant, responses should be strictly limited to Skald’s features and workflows—such as task and note management, onboarding, and UI questions—while ignoring queries about unrelated integrations or unimplemented backend/server features`
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
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    setConvo(prev => [...prev, {id: prev.length, message: reply}])
    console.log(reply);
  }

  const handlePrompt = (e: React.KeyboardEvent | React.MouseEvent) => {
    e.preventDefault()
    const textarea = textareaRef.current
    setConvo(prev => [...prev, {id: prev.length, message: prompt}])
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
    <div className="relative col-span-1 row-span-1 grid grid-cols-[1fr] grid-rows-[1fr] bg-white/2 backdrop-blur-md border border-white/6 rounded-md shadow-lg p-[24px] overflow-y-auto">
      <div className="w-full overflow-y-auto col-span-1 row-span-1">
        <div className="pb-[50px]">
          {convo.map(c => (
            c.id % 2 == 0
              ? (
                <div 
                  key={c.id} 
                  className="w-full max-w-[720px] grid grid-cols-[52px_1fr] pl-[18px]"
                >
                  <GoHubot className=" text-[20px] text-[#0f111a] bg-white size-auto p-[8px] rounded-3xl" />

                  <p className="mt-[4px]">
                    {c.message}
                  </p>
                </div>
              )
              : (
                <div 
                  key={c.id}
                  className="ml-auto flex justify-end w-full max-w-[720px] pr-[18px]"
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
        </div>
      </div>

      <div
        className="sticky bottom-0 m-auto grid grid-rows-[1fr_32px] gap-[12px] w-full max-w-[690px] bg-white/6 backdrop-blur-md border border-white/10 rounded-3xl shadow-lg p-3"
        // onSubmit={handlePrompt}
      >
        <textarea
          ref={textareaRef}
          onInput={handleInput}
          className="text-white resize-none outline-none w-full bg-transparent  text-[14px]"
          placeholder="Ask Mr. Groff..."
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