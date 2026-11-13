import { Fragment, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowDown, ArrowRight, Bot, CalendarDays, Check, Command, ListTodo, Moon, NotebookPen, Settings, Sparkles, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppStore } from "@/store/appStore";
import BrandMark from "@/components/BrandMark";

const previewTasks = [
  { title: "Make space for the important work", label: "Focus", time: "09:30", checked: true },
  { title: "Send the project outline", label: "Studio", time: "11:00", checked: false },
  { title: "Take a walk without your phone", label: "Personal", time: "16:30", checked: false },
]
const rotatingHeroWords = ["focus.", "flow.", "freedom.", "feeling."]

type MorphCharacter = { id: string; label: string }

const morphCharacters = (
  previous: MorphCharacter[],
  next: string[],
  idPrefix: string,
): MorphCharacter[] => {
  const lcs = Array.from({ length: previous.length + 1 }, () => Array<number>(next.length + 1).fill(0))

  for (let oldIndex = previous.length - 1; oldIndex >= 0; oldIndex -= 1) {
    for (let nextIndex = next.length - 1; nextIndex >= 0; nextIndex -= 1) {
      lcs[oldIndex][nextIndex] = previous[oldIndex].label === next[nextIndex]
        ? lcs[oldIndex + 1][nextIndex + 1] + 1
        : Math.max(lcs[oldIndex + 1][nextIndex], lcs[oldIndex][nextIndex + 1])
    }
  }

  const matched = new Map<number, MorphCharacter>()
  let oldIndex = 0
  let nextIndex = 0

  while (oldIndex < previous.length && nextIndex < next.length) {
    if (previous[oldIndex].label === next[nextIndex]) {
      matched.set(nextIndex, previous[oldIndex])
      oldIndex += 1
      nextIndex += 1
    } else if (lcs[oldIndex + 1][nextIndex] >= lcs[oldIndex][nextIndex + 1]) {
      oldIndex += 1
    } else {
      nextIndex += 1
    }
  }

  return next.map((label, index) => matched.get(index) ?? {
    id: `${idPrefix}-${index}`,
    label,
  })
}

const SplitTextWord = ({ word, reducedMotion }: { word: string; reducedMotion: boolean | null }) => (
  <motion.span
    className="skald-hero__word"
    variants={{
      hidden: {},
      visible: { transition: { staggerChildren: reducedMotion ? 0 : 0.025 } },
    }}
  >
    {Array.from(word).map((letter, index) => (
      <motion.span
        className="skald-hero__letter"
        key={`${letter}-${index}`}
        variants={{
          hidden: { opacity: 0, scale: 0.78 },
          visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: reducedMotion ? 0 : 0.36, ease: "easeOut" },
          },
        }}
      >
        {letter}
      </motion.span>
    ))}
  </motion.span>
)

const MorphingHeroWord = ({ word, reducedMotion }: { word: string; reducedMotion: boolean | null }) => {
  const id = useId()
  const generation = useRef(0)
  const previousWord = useRef(word)
  const [characters, setCharacters] = useState<MorphCharacter[]>(() =>
    Array.from(word).map((label, index) => ({ id: `${id}-initial-${index}`, label })),
  )

  useEffect(() => {
    if (previousWord.current === word) return
    previousWord.current = word
    generation.current += 1
    setCharacters((previous) => morphCharacters(previous, Array.from(word), `${id}-${generation.current}`))
  }, [id, word])

  return (
    <span className="skald-hero__rotating-current" aria-hidden="true">
      <AnimatePresence initial={false} mode="popLayout">
        {characters.map((character) => (
          <motion.span
            key={character.id}
            layout="position"
            initial={reducedMotion ? false : { opacity: 0, filter: "blur(3px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(3px)" }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            {character.label}
          </motion.span>
        ))}
      </AnimatePresence>
    </span>
  )
}

const Home = () => {
  const isDark = useAppStore((state) => state.isDark)
  const setTheme = useAppStore((state) => state.setTheme)
  const reducedMotion = useReducedMotion()
  const [heroWordIndex, setHeroWordIndex] = useState(0)
  const previewRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: previewRef,
    offset: ["start end", "end start"],
  })
  const previewTiltProgress = useTransform(scrollYProgress, [0.35, 0.75], [0, 1])
  const previewRotateX = useTransform(previewTiltProgress, [0, 1], [0, 8])
  const previewRotateY = useTransform(previewTiltProgress, [0, 1], [0, -4])
  const smoothPreviewRotateX = useSpring(previewRotateX, { stiffness: 150, damping: 25, mass: 0.65 })
  const smoothPreviewRotateY = useSpring(previewRotateY, { stiffness: 150, damping: 25, mass: 0.65 })
  const heroWord = rotatingHeroWords[heroWordIndex]
  const valueItemVariants = reducedMotion
    ? { hidden: {}, visible: {} }
    : {
        hidden: { opacity: 0, filter: "blur(3px)" },
        visible: {
          opacity: 1,
          filter: "blur(0px)",
          transition: { duration: 0.3, ease: "easeOut" as const },
        },
      }
  const invitationItemVariants = reducedMotion
    ? { hidden: {}, visible: {} }
    : {
        hidden: { opacity: 0, filter: "blur(3px)" },
        visible: {
          opacity: 1,
          filter: "blur(0px)",
          transition: { duration: 0.34, ease: "easeOut" as const },
        },
      }
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).toUpperCase()

  useEffect(() => {
    if (reducedMotion) return

    const timeoutId = window.setTimeout(() => {
      setHeroWordIndex((index) => (index + 1) % rotatingHeroWords.length)
    }, 2600)

    return () => window.clearTimeout(timeoutId)
  }, [heroWordIndex, reducedMotion])

  return (
    <main className={`skald-home ${isDark ? 'skald-home--dark' : 'skald-home--light'}`}>
      <motion.nav
        className="skald-nav"
        aria-label="Main navigation"
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <Link to="/" className="skald-brand" aria-label="Skald home">
          <BrandMark />
        </Link>

        <div className="skald-nav__links">
          <a href="#why-skald">The feeling</a>
          <a href="#how-it-works">How it works</a>
        </div>

        <div className="skald-nav__actions">
          <motion.button
            type="button"
            className="skald-icon-button"
            onClick={() => setTheme(!isDark)}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
            whileHover={reducedMotion ? undefined : { rotate: 8 }}
            whileTap={reducedMotion ? undefined : { scale: 0.96 }}
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </motion.button>
          <Link to="/signin" className="skald-nav__login">Log in</Link>
          <Link to="/signup" className="skald-button skald-button--small">
            Get started <ArrowRight size={15} />
          </Link>
        </div>
      </motion.nav>

      <section className="skald-hero">
        <div className="skald-hero__copy">
          <div className="skald-eyebrow">
            <Sparkles size={14} aria-hidden="true" />
            A quieter way to get things done
          </div>
          <motion.h1
            aria-label={`Make room for ${heroWord}`}
            initial={reducedMotion ? false : "hidden"}
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: reducedMotion ? 0 : 0.12 } },
            }}
          >
            <motion.span
              className="skald-hero__line"
              aria-hidden="true"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: reducedMotion ? 0 : 0.08 } },
              }}
            >
              {["Make", "room", "for"].map((word, index) => (
                <Fragment key={word}>
                  <SplitTextWord word={word} reducedMotion={reducedMotion} />
                  {index < 2 ? " " : null}
                </Fragment>
              ))}
            </motion.span>
            <span
              className="skald-hero__line skald-hero__line--accent"
              aria-hidden="true"
            >
              <span className="skald-hero__rotating-word">
                <span className="skald-hero__rotating-measure" aria-hidden="true">freedom.</span>
                <MorphingHeroWord word={heroWord} reducedMotion={reducedMotion} />
              </span>
            </span>
          </motion.h1>
          <p className="skald-hero__description">
            Your tasks, notes, and next good idea—together in a space that helps you find your way back to focus.
          </p>
          <div className="skald-hero__actions">
            <Link to="/signup" className="skald-button">
              Find your focus <ArrowRight size={17} />
            </Link>
            <a href="#why-skald" className="skald-text-link">
              Take a look <ArrowDown size={15} />
            </a>
          </div>
          <p className="skald-hero__aside">A small step toward a less scattered day.</p>
        </div>

        <div ref={previewRef} className="skald-preview" aria-label="Preview of the Skald workspace">
          <motion.div
            className="skald-preview__window"
            style={{
              rotateX: reducedMotion ? 0 : smoothPreviewRotateX,
              rotateY: reducedMotion ? 0 : smoothPreviewRotateY,
              transformStyle: "preserve-3d",
            }}
          >
            <aside className="skald-preview__sidebar">
              <div className="skald-preview__mini-brand">
                <BrandMark />
              </div>
              <div className="skald-preview__workspace-label">WORKSPACE</div>
              <div className="skald-preview__nav-item skald-preview__nav-item--active">
                <CalendarDays size={14} /> Today <span className="skald-preview__count">3</span>
              </div>
              <div className="skald-preview__nav-item"><ListTodo size={14} /> Tasks</div>
              <div className="skald-preview__nav-item"><NotebookPen size={14} /> Notes</div>
              <div className="skald-preview__nav-item"><Bot size={14} /> Mr Groff</div>
              <div className="skald-preview__sidebar-bottom">
                <Settings size={14} />
                <span>Settings</span>
              </div>
            </aside>

            <div className="skald-preview__main">
              <div className="skald-preview__topline">
                <span>{today}</span>
                <span className="skald-preview__weather">A little more clarity <Sparkles size={12} /></span>
              </div>
              <h2>Good morning.</h2>
              <p className="skald-preview__subheading">Here’s a little room to begin.</p>

              <div className="skald-preview__focus-card">
                <div className="skald-preview__focus-icon"><Sparkles size={16} /></div>
                <div>
                  <span className="skald-preview__section-label">A GENTLE NUDGE</span>
                  <p>Start with one thing. Let the rest wait.</p>
                </div>
                <ArrowRight size={15} className="skald-preview__focus-arrow" />
              </div>

              <div className="skald-preview__tasks-heading">
                <span>In your orbit</span>
                <span>3 things</span>
              </div>
              <div className="skald-preview__tasks">
                {previewTasks.map((task) => (
                  <div className="skald-preview__task" key={task.title}>
                    <span className={`skald-preview__check ${task.checked ? 'is-checked' : ''}`}>
                      {task.checked && <Check size={10} />}
                    </span>
                    <span className={`skald-preview__task-title ${task.checked ? 'is-done' : ''}`}>{task.title}</span>
                    <span className="skald-preview__task-label">{task.label}</span>
                    <time>{task.time}</time>
                  </div>
                ))}
              </div>

              <div className="skald-preview__assistant">
                <span className="skald-preview__assistant-mark"><Sparkles size={14} /></span>
                <span>Need a hand finding the next step?</span>
                <span className="skald-preview__assistant-arrow"><ArrowRight size={13} /></span>
              </div>
            </div>
          </motion.div>
          <div className="skald-preview__glow" />
          <div className="skald-preview__shortcut"><Command size={12} /> A little less noise. A little more you.</div>
        </div>
      </section>

      <section id="why-skald" className="skald-values">
        <motion.div
          className="skald-values__intro"
          initial={reducedMotion ? false : { opacity: 0, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: reducedMotion ? 0 : 0.55, ease: "easeOut" }}
        >
          <span className="skald-section-label">A SPACE THAT GETS OUT OF THE WAY</span>
          <h2>Less managing your tools.<br /><span>More living your day.</span></h2>
        </motion.div>
        <div className="skald-values__grid">
          <motion.article
            className="skald-value"
            initial={reducedMotion ? false : "hidden"}
            whileInView="visible"
            variants={{
              hidden: { opacity: 0, filter: "blur(5px)" },
              visible: {
                opacity: 1,
                filter: "blur(0px)",
                transition: {
                  duration: reducedMotion ? 0 : 0.45,
                  delay: reducedMotion ? 0 : 0.04,
                  staggerChildren: reducedMotion ? 0 : 0.08,
                  ease: "easeOut",
                },
              },
            }}
            viewport={{ once: true, amount: 0.4 }}
            whileHover={reducedMotion ? undefined : { borderColor: "var(--home-accent)" }}
          >
            <motion.span className="skald-value__number" variants={valueItemVariants}>01</motion.span>
            <motion.h3 variants={valueItemVariants}>Gather your thoughts</motion.h3>
            <motion.p variants={valueItemVariants}>Keep the small things and big ideas in one calm, personal space.</motion.p>
          </motion.article>
          <motion.article
            className="skald-value"
            initial={reducedMotion ? false : "hidden"}
            whileInView="visible"
            variants={{
              hidden: { opacity: 0, filter: "blur(5px)" },
              visible: {
                opacity: 1,
                filter: "blur(0px)",
                transition: {
                  duration: reducedMotion ? 0 : 0.45,
                  delay: reducedMotion ? 0 : 0.11,
                  staggerChildren: reducedMotion ? 0 : 0.08,
                  ease: "easeOut",
                },
              },
            }}
            viewport={{ once: true, amount: 0.4 }}
            whileHover={reducedMotion ? undefined : { borderColor: "var(--home-accent)" }}
          >
            <motion.span className="skald-value__number" variants={valueItemVariants}>02</motion.span>
            <motion.h3 variants={valueItemVariants}>Choose what matters now</motion.h3>
            <motion.p variants={valueItemVariants}>A clear view of today makes the next step feel a little lighter.</motion.p>
          </motion.article>
          <motion.article
            className="skald-value"
            initial={reducedMotion ? false : "hidden"}
            whileInView="visible"
            variants={{
              hidden: { opacity: 0, filter: "blur(5px)" },
              visible: {
                opacity: 1,
                filter: "blur(0px)",
                transition: {
                  duration: reducedMotion ? 0 : 0.45,
                  delay: reducedMotion ? 0 : 0.18,
                  staggerChildren: reducedMotion ? 0 : 0.08,
                  ease: "easeOut",
                },
              },
            }}
            viewport={{ once: true, amount: 0.4 }}
            whileHover={reducedMotion ? undefined : { borderColor: "var(--home-accent)" }}
          >
            <motion.span className="skald-value__number" variants={valueItemVariants}>03</motion.span>
            <motion.h3 variants={valueItemVariants}>Find your rhythm</motion.h3>
            <motion.p variants={valueItemVariants}>Mr Groff helps you think through the day. Your choices stay yours.</motion.p>
          </motion.article>
        </div>
      </section>

      <motion.section
        id="how-it-works"
        className="skald-invitation"
        initial={reducedMotion ? false : "hidden"}
        whileInView="visible"
        variants={{
          hidden: { opacity: 0, filter: "blur(6px)" },
          visible: {
            opacity: 1,
            filter: "blur(0px)",
            transition: {
              duration: reducedMotion ? 0 : 0.55,
              delayChildren: reducedMotion ? 0 : 0.08,
              staggerChildren: reducedMotion ? 0 : 0.09,
              ease: "easeOut",
            },
          },
        }}
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.div
          className="skald-invitation__mark"
          initial={reducedMotion ? false : { rotate: -7, scale: 0.94 }}
          whileInView={reducedMotion ? undefined : { rotate: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <Sparkles size={20} />
        </motion.div>
        <motion.p variants={invitationItemVariants}>Start where you are.</motion.p>
        <motion.h2 variants={invitationItemVariants}>Your day doesn’t need<br />another dashboard.</motion.h2>
        <motion.span variants={invitationItemVariants}>It needs a little space to become yours.</motion.span>
        <motion.div variants={invitationItemVariants}>
          <Link to="/signup" className="skald-button">
            Step inside <ArrowRight size={17} />
          </Link>
        </motion.div>
      </motion.section>

      <footer className="skald-footer">
        <Link to="/" className="skald-brand" aria-label="Skald home">
          <BrandMark />
        </Link>
        <span>Make room for what matters.</span>
        <span>© {new Date().getFullYear()} Skald</span>
      </footer>
    </main>
  )
}

export default Home
