export default function Page() {
  return (
    <div className="shell">
      <header className="nav">
        <a href="/" className="wordmark" aria-label="DS Extraction Workshop home">
          <span className="wordmark__mark">v0.1</span>
          Skill&nbsp;Extraction
        </a>
        <a href="#demo" className="nav__cta">
          <span className="nav__cta-long">Request a session</span>
          <span className="nav__cta-short">Demo →</span>
        </a>
      </header>

      <main>
        {/* ── hero · the stage spine ───────────────────────────── */}
        <section className="hero" aria-labelledby="hero-spine">
          <h1 id="hero-spine" className="hero__spine">
            <span className="v">1.0</span>Extract
            <span className="sep"> · </span>
            <span className="v">2.0</span>Generate
            <span className="sep"> · </span>
            <span className="v">3.0</span>Audit
            <span aria-hidden="true">.</span>
          </h1>

          <div className="hero__meta">
            <p className="hero__lede">
              A hands-on workshop. Three phases inside Claude Code, against a
              real design system. You leave with a <em>skill artefact</em>, a
              generated sign-in form, and a PASS/FAIL audit you can run on your
              own components after lunch.
            </p>
            <p className="hero__stamp">
              60-minute workshop · run locally · Primer used for the demo
            </p>
          </div>
        </section>

        {/* ── stage 1.0 · discovery ────────────────────────────── */}
        <section className="stage" aria-labelledby="stage-1">
          <header className="stage__head">
            <span className="stage__num">Stage 1.0 — Discovery</span>
            <h2 id="stage-1" className="stage__title">
              Read the system. Extract the literacy.
            </h2>
          </header>

          <div className="stage__body">
            <div className="stage__prose">
              <p>
                You run the <code>extract-ds-skill</code> meta-skill against a
                real component library — Primer in the starter, your own design
                system after the workshop. The agent reads the wrappers, opens
                <code>DESIGN.md</code>, and surfaces a discovery summary.
              </p>
              <p>
                It pauses at a <strong>[VERIFY]</strong> gate. You confirm or
                correct the inferred conventions, then the agent writes the
                extracted skill into <code>.claude/skills/ds/</code>. The
                artefact is a small, opinionated literacy file — not a generated
                wall of rules.
              </p>
            </div>

            <dl className="stage__aside" aria-label="Stage 1 details">
              <div className="row">
                <dt>Input</dt>
                <dd>
                  <code>ds/</code> + <code>DESIGN.md</code>
                </dd>
              </div>
              <div className="row">
                <dt>Gate</dt>
                <dd>
                  <code>[VERIFY]</code> — human confirms
                </dd>
              </div>
              <div className="row">
                <dt>Output</dt>
                <dd>
                  <code>.claude/skills/ds/</code>
                </dd>
              </div>
              <div className="row">
                <dt>Time</dt>
                <dd>~10 min</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* ── stage 2.0 · generation ───────────────────────────── */}
        <section className="stage" aria-labelledby="stage-2">
          <header className="stage__head">
            <span className="stage__num">Stage 2.0 — Generation</span>
            <h2 id="stage-2" className="stage__title">
              Hand the skill to Claude. Build the form.
            </h2>
          </header>

          <div className="stage__body">
            <div className="stage__prose">
              <p>
                You open <code>prompts/sign-in.md</code> and ask Claude Code to
                build a sign-in form using the wrappers in <code>ds/</code>.
                The agent now reads through the lens of the extracted skill —
                it knows the conventions, the disallowed props, the naming you
                signed off on at the gate.
              </p>
              <p>
                The form arrives at <code>app/sign-in.tsx</code>. It compiles,
                it runs, it looks plausible. The question is whether it
                actually obeys the system — which is what stage 3.0 is for.
              </p>
            </div>

            <dl className="stage__aside" aria-label="Stage 2 details">
              <div className="row">
                <dt>Prompt</dt>
                <dd>
                  <code>prompts/sign-in.md</code>
                </dd>
              </div>
              <div className="row">
                <dt>Tools</dt>
                <dd>Claude Code + <code>ds/</code></dd>
              </div>
              <div className="row">
                <dt>Output</dt>
                <dd>
                  <code>app/sign-in.tsx</code>
                </dd>
              </div>
              <div className="row">
                <dt>Time</dt>
                <dd>~15 min</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* ── stage 3.0 · audit ────────────────────────────────── */}
        <section className="stage" aria-labelledby="stage-3">
          <header className="stage__head">
            <span className="stage__num">Stage 3.0 — Audit</span>
            <h2 id="stage-3" className="stage__title">
              Audit the build against the skill it was given.
            </h2>
          </header>

          <div className="stage__body">
            <div className="stage__prose">
              <p>
                You run the audit prompt from <code>prompts/audit.md</code>.
                The agent walks <code>app/sign-in.tsx</code> rule by rule and
                returns PASS / FAIL per rule, with <code>file:line</code>{" "}
                citations. The headline finding is usually the{" "}
                <code>inactive</code> vs <code>disabled</code> violation —
                Primer separates the two; most generated forms collapse them.
              </p>
              <p>
                You leave the workshop with the audit transcript and the
                pattern you just lived through: extract a skill, generate
                against it, audit, iterate.
              </p>
            </div>

            <dl className="stage__aside" aria-label="Stage 3 details">
              <div className="row">
                <dt>Prompt</dt>
                <dd>
                  <code>prompts/audit.md</code>
                </dd>
              </div>
              <div className="row">
                <dt>Target</dt>
                <dd>
                  <code>app/sign-in.tsx</code>
                </dd>
              </div>
              <div className="row">
                <dt>Output</dt>
                <dd>PASS/FAIL + citations</dd>
              </div>
              <div className="row">
                <dt>Time</dt>
                <dd>~15 min</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* ── outcome ──────────────────────────────────────────── */}
        <section className="outcome" aria-labelledby="outcome-head">
          <p className="outcome__head">What you leave with</p>
          <h2 id="outcome-head" className="outcome__title">
            Three artefacts. One repeatable pattern.
          </h2>

          <ol className="outcome__list">
            <li>
              <div>
                <strong>The extracted skill</strong>
                <p>
                  A small literacy file at <code>.claude/skills/ds/</code> that
                  the agent reads before it writes a single line against your
                  components. Reusable on your own design system.
                </p>
              </div>
            </li>
            <li>
              <div>
                <strong>The generated form</strong>
                <p>
                  An <code>app/sign-in.tsx</code> built by Claude through the
                  skill — proof the extraction round-trips into real output.
                </p>
              </div>
            </li>
            <li>
              <div>
                <strong>The PASS/FAIL audit</strong>
                <p>
                  A rule-by-rule transcript showing what the agent obeyed,
                  what it drifted on, and the citation for each one. The
                  workshop&rsquo;s actual deliverable — the loop you take home.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* ── demo CTA · single statement ──────────────────────── */}
        <section className="cta" id="demo" aria-labelledby="cta-line">
          <p id="cta-line" className="cta__line">
            Run it against <span className="accent">your</span> design system
            with us in the room.
          </p>
          <a href="mailto:workshop@example.com?subject=DS%20Extraction%20Workshop%20%E2%80%94%20session%20request" className="cta__button">
            Request a session →
          </a>
          <p className="cta__note">
            For product teams running their own component library. We bring
            the harness; you bring <code>ds/</code> and <code>DESIGN.md</code>.
          </p>
        </section>
      </main>

      {/* ── footer · Ft4 dense colophon ────────────────────────── */}
      <footer className="foot">
        <p className="foot__colophon">
          <span className="brand">DS&nbsp;Skill&nbsp;Extraction&nbsp;Workshop</span>{" "}
          · v0.1 · Built with Fraunces, IBM Plex Sans, and JetBrains Mono.
          Powered by Claude Code on Next.js. Primer is GitHub&rsquo;s
          open-source design system, used here for educational purposes; the
          workshop is not affiliated with GitHub. Source on{" "}
          <a
            className="foot__link"
            href="https://github.com/vercel-labs/ds-skill-extraction-workshop"
          >
            github.com/vercel-labs
          </a>
          . MIT licensed.
        </p>
      </footer>
    </div>
  );
}
