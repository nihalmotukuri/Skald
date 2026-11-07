import { ArrowDown, ArrowRight, Check, Command, Layers3, Moon, Sparkles, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppStore } from "@/store/appStore";

const previewTasks = [
  { title: "Make space for the important work", label: "Focus", time: "09:30", checked: true },
  { title: "Send the project outline", label: "Studio", time: "11:00", checked: false },
  { title: "Take a walk without your phone", label: "Personal", time: "16:30", checked: false },
]

const Home = () => {
  const isDark = useAppStore((state) => state.isDark)
  const setTheme = useAppStore((state) => state.setTheme)
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).toUpperCase()

  return (
    <main className={`skald-home ${isDark ? 'skald-home--dark' : 'skald-home--light'}`}>
      <nav className="skald-nav" aria-label="Main navigation">
        <Link to="/" className="skald-brand" aria-label="Skald home">
          <img src={isDark ? "/images/logo.png" : "/images/logo-dark.png"} alt="" />
          <span>SKALD</span>
        </Link>

        <div className="skald-nav__links">
          <a href="#why-skald">The feeling</a>
          <a href="#how-it-works">How it works</a>
        </div>

        <div className="skald-nav__actions">
          <button
            type="button"
            className="skald-icon-button"
            onClick={() => setTheme(!isDark)}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <Link to="/signin" className="skald-nav__login">Log in</Link>
          <Link to="/signin" className="skald-button skald-button--small">
            Get started <ArrowRight size={15} />
          </Link>
        </div>
      </nav>

      <section className="skald-hero">
        <div className="skald-hero__copy skald-enter">
          <div className="skald-eyebrow">
            <Sparkles size={14} aria-hidden="true" />
            A quieter way to get things done
          </div>
          <h1>
            Make room for
            <span> what matters.</span>
          </h1>
          <p className="skald-hero__description">
            Your tasks, notes, and next good idea—together in a space that helps you find your way back to focus.
          </p>
          <div className="skald-hero__actions">
            <Link to="/signin" className="skald-button">
              Find your focus <ArrowRight size={17} />
            </Link>
            <a href="#why-skald" className="skald-text-link">
              Take a look <ArrowDown size={15} />
            </a>
          </div>
          <p className="skald-hero__aside">A small step toward a less scattered day.</p>
        </div>

        <div className="skald-preview skald-enter" aria-label="Preview of the Skald workspace">
          <div className="skald-preview__window">
            <aside className="skald-preview__sidebar">
              <div className="skald-preview__mini-brand">
                <img src="/images/logo.png" alt="" />
                <span>skald</span>
              </div>
              <div className="skald-preview__workspace-label">WORKSPACE</div>
              <div className="skald-preview__nav-item skald-preview__nav-item--active">
                <span className="skald-preview__nav-dot" /> Today <span className="skald-preview__count">3</span>
              </div>
              <div className="skald-preview__nav-item"><Layers3 size={14} /> Tasks</div>
              <div className="skald-preview__nav-item"><span className="skald-preview__note-icon">▤</span> Notes</div>
              <div className="skald-preview__sidebar-bottom">
                <span className="skald-preview__avatar">S</span>
                <span>your space</span>
                <span className="skald-preview__presence" />
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
          </div>
          <div className="skald-preview__glow" />
          <div className="skald-preview__shortcut"><Command size={12} /> A little less noise. A little more you.</div>
        </div>
      </section>

      <section id="why-skald" className="skald-values">
        <div className="skald-values__intro">
          <span className="skald-section-label">A SPACE THAT GETS OUT OF THE WAY</span>
          <h2>Less managing your tools.<br /><span>More living your day.</span></h2>
        </div>
        <div className="skald-values__grid">
          <article className="skald-value">
            <span className="skald-value__number">01</span>
            <h3>Gather your thoughts</h3>
            <p>Keep the small things and big ideas in one calm, personal space.</p>
          </article>
          <article className="skald-value">
            <span className="skald-value__number">02</span>
            <h3>Choose what matters now</h3>
            <p>A clear view of today makes the next step feel a little lighter.</p>
          </article>
          <article className="skald-value">
            <span className="skald-value__number">03</span>
            <h3>Find your rhythm</h3>
            <p>Mr Groff helps you think through the day. Your choices stay yours.</p>
          </article>
        </div>
      </section>

      <section id="how-it-works" className="skald-invitation">
        <div className="skald-invitation__mark"><Sparkles size={20} /></div>
        <p>Start where you are.</p>
        <h2>Your day doesn’t need<br />another dashboard.</h2>
        <span>It needs a little space to become yours.</span>
        <Link to="/signin" className="skald-button">
          Step inside <ArrowRight size={17} />
        </Link>
      </section>

      <footer className="skald-footer">
        <Link to="/" className="skald-brand" aria-label="Skald home">
          <img src={isDark ? "/images/logo.png" : "/images/logo-dark.png"} alt="" />
          <span>SKALD</span>
        </Link>
        <span>Make room for what matters.</span>
        <span>© {new Date().getFullYear()} Skald</span>
      </footer>
    </main>
  )
}

export default Home
