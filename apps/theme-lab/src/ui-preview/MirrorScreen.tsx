// "Mirror · CLI parity" concept (Figma node 2850:3075) rebuilt with generated tokens only, so any
// theme from the lab can be previewed on a real screen. Colors come from mirror.css via CSS custom
// properties; nothing here is a hard-coded color except the OS window controls.

import { useState } from 'react'
import arrowDown from './icons/arrow-down.svg'
import arrowLeft from './icons/arrow-left.svg'
import arrowRight from './icons/arrow-right.svg'
import arrowUp from './icons/arrow-up.svg'
import book from './icons/book.svg'
import check14 from './icons/check-14.svg'
import check from './icons/check.svg'
import chevronDown10 from './icons/chevron-down-10.svg'
import chevronDown16 from './icons/chevron-down-16.svg'
import chevronDownComposer from './icons/chevron-down-composer.svg'
import chevronRight12 from './icons/chevron-right-12.svg'
import chevronRight from './icons/chevron-right.svg'
import circleAlert from './icons/circle-alert.svg'
import circleFilled from './icons/circle-filled.svg'
import circle from './icons/circle.svg'
import cloud from './icons/cloud.svg'
import codeFork from './icons/code-fork.svg'
import codePullRequest from './icons/code-pull-request.svg'
import comment from './icons/comment.svg'
import copy from './icons/copy.svg'
import fileCode14 from './icons/file-code-14.svg'
import fileCode from './icons/file-code.svg'
import folderOpen14 from './icons/folder-open-14.svg'
import folderOpen from './icons/folder-open.svg'
import folder from './icons/folder.svg'
import layoutSideContentLeft from './icons/layout-side-content-left.svg'
import list from './icons/list.svg'
import pencilToSquare from './icons/pencil-to-square.svg'
import plusMuted from './icons/plus-muted.svg'
import plus from './icons/plus.svg'
import search from './icons/search.svg'
import server from './icons/server.svg'
import shieldCheck from './icons/shield-check.svg'
import undo2 from './icons/undo-2.svg'
import './mirror.css'

/** The SVG asset drawn as a mask, so it takes the token color of its context (`currentColor`). */
function Icon({ src, size, tone }: { src: string; size: number; tone?: 'subtle' | 'success' | 'warning' }) {
  return (
    <span
      aria-hidden
      className={tone ? `m-icon m-tone-${tone}` : 'm-icon'}
      style={{ width: size, height: size, maskImage: `url("${src}")`, WebkitMaskImage: `url("${src}")` }}
    />
  )
}

const WORKTREES = [
  { name: 'tool-streaming', key: '⌘1', icon: circle, tone: 'subtle' as const },
  { name: 'retry-backoff', key: '⌘2', icon: circleAlert, tone: 'warning' as const },
  { name: 'flaky-snapshot', key: '⌘3', icon: circleFilled, tone: 'success' as const },
  { name: 'vitest-3-2', key: '⌘4', icon: check, tone: 'subtle' as const },
]

const DIFF: { n: string; sign: string; code: string }[] = [
  { n: '38', sign: ' ', code: 'async send(call: ToolCall) {' },
  { n: '39', sign: '−', code: '  const output = await call.run();' },
  { n: '40', sign: '−', code: '  this.client.write(output);' },
  { n: '39', sign: '+', code: '  for await (const chunk of call.stream()) {' },
  { n: '40', sign: '+', code: '    if (call.signal.aborted) break;' },
  { n: '41', sign: '+', code: '    this.client.write(chunk, { flush: true });' },
  { n: '42', sign: '+', code: '  }' },
  { n: '43', sign: ' ', code: 'this.client.end(call.id);' },
]

export function MirrorScreen() {
  const [selected, setSelected] = useState('tool-streaming')
  const [focused, setFocused] = useState(true)

  return (
    <div className="m-window">
      <aside className="m-sidebar">
        <div className="m-titlebar">
          <span className="m-traffic">
            <i style={{ background: '#ff5f57' }} />
            <i style={{ background: '#febc2e' }} />
            <i style={{ background: '#28c840' }} />
          </span>
          <span className="m-spacer" />
          <button type="button" className="m-ghost m-icon-btn" aria-label="Toggle sidebar">
            <Icon src={layoutSideContentLeft} size={16} />
          </button>
        </div>

        <nav className="m-nav">
          <button type="button" className="m-item">
            <Icon src={pencilToSquare} size={16} />
            <span className="m-item-label">New conversation</span>
            <kbd className="m-kbd">⌘N</kbd>
          </button>
          <button type="button" className="m-item">
            <Icon src={search} size={16} />
            <span className="m-item-label">Search</span>
            <kbd className="m-kbd">⌘K</kbd>
          </button>
          <button type="button" className="m-item">
            <Icon src={book} size={16} />
            <span className="m-item-label">Skills</span>
            <span className="m-count">12</span>
          </button>

          <hr className="m-divider" />

          <div className="m-section">
            <div className="m-section-label">
              <span>Projects</span>
              <span className="m-spacer" />
              <button type="button" className="m-ghost m-icon-btn m-icon-btn-sm" aria-label="Add project">
                <Icon src={plus} size={16} />
              </button>
            </div>
            <button type="button" className="m-item m-item-project">
              <Icon src={chevronDown16} size={16} />
              <Icon src={folderOpen} size={16} />
              <span className="m-item-label">reflection / harness</span>
              <span className="m-count">4</span>
            </button>
            <div className="m-nested">
              {WORKTREES.map((w) => (
                <button
                  type="button"
                  key={w.name}
                  className={w.name === selected ? 'm-item m-selected' : 'm-item'}
                  onClick={() => setSelected(w.name)}
                >
                  <Icon src={w.icon} size={16} tone={w.tone} />
                  <span className="m-item-label">{w.name}</span>
                  <span className="m-count">{w.key}</span>
                </button>
              ))}
              <button type="button" className="m-item m-item-muted">
                <Icon src={plusMuted} size={16} tone="subtle" />
                <span className="m-item-label">New worktree…</span>
              </button>
            </div>
            <button type="button" className="m-item m-item-project">
              <Icon src={chevronRight} size={16} />
              <Icon src={folder} size={16} />
              <span className="m-item-label">reflection / web</span>
              <span className="m-count">2</span>
            </button>
            <button type="button" className="m-item m-item-project">
              <Icon src={chevronRight} size={16} />
              <Icon src={folder} size={16} />
              <span className="m-item-label">gamedev / ps1-houses</span>
            </button>
          </div>

          <hr className="m-divider" />

          <div className="m-section">
            <div className="m-section-label">
              <span>Recents</span>
              <Icon src={chevronRight12} size={12} tone="subtle" />
            </div>
            <button type="button" className="m-item">
              <Icon src={comment} size={16} />
              <span className="m-item-label">Explain the session store</span>
              <span className="m-count">Mon</span>
            </button>
            <button type="button" className="m-item">
              <Icon src={comment} size={16} />
              <span className="m-item-label">Add keyboard shortcuts</span>
              <span className="m-count">Sep 25</span>
            </button>
          </div>
        </nav>
      </aside>

      <main className="m-pane">
        <header className="m-header">
          <button type="button" className="m-ghost m-icon-btn" aria-label="Back">
            <Icon src={arrowLeft} size={16} />
          </button>
          <button type="button" className="m-ghost m-icon-btn" aria-label="Forward">
            <Icon src={arrowRight} size={16} />
          </button>
          <span style={{ width: 4 }} />
          <h1 className="m-title">Stream tool output as it arrives</h1>
          <span className="m-env">
            <Icon src={cloud} size={14} />
            devbox-01
          </span>
          <button type="button" className="m-ghost m-select">
            <Icon src={list} size={14} />
            Compact
            <Icon src={chevronDown10} size={10} />
          </button>
        </header>

        <div className="m-feed">
          <div className="m-worked">
            <span className="m-worked-label">
              Worked for 2m 14s
              <Icon src={chevronRight12} size={12} />
            </span>
            <hr className="m-divider" />
          </div>

          <div className="m-align-right">
            <div className="m-user-message">
              <p>
                Stream tool output as it arrives. Keep cancellation and retries working, and add a test for a dropped
                connection.
              </p>
              <div className="m-attachments">
                <span className="m-tag">
                  <Icon src={codePullRequest} size={12} />
                  issue #482
                </span>
                <span className="m-tag">
                  <Icon src={fileCode} size={12} />
                  stream.ts
                </span>
              </div>
            </div>
          </div>

          <div className="m-align-right m-meta">
            <span>Mon 18:37</span>
            <button type="button" className="m-ghost m-rewind">
              <Icon src={undo2} size={12} />
              Rewind
            </button>
            <button type="button" className="m-ghost m-icon-btn m-icon-btn-xs" aria-label="Copy">
              <Icon src={copy} size={14} />
            </button>
          </div>

          <p className="m-body">
            I'll switch the transport to flush each chunk as soon as it's produced, then check that cancellation and
            reconnects still behave.
          </p>

          <div className="m-steps">
            <div className="m-step">
              <Icon src={check14} size={14} />
              <span className="m-step-strong">Explored 3 reads, 1 search</span>
              <Icon src={chevronRight12} size={12} tone="subtle" />
            </div>
            <div className="m-step">
              <Icon src={check14} size={14} />
              <span>
                <span className="m-step-strong">Ran</span>
                <span className="m-subtle"> pnpm typecheck · Found 0 errors (+3 lines)</span>
              </span>
              <Icon src={chevronRight12} size={12} tone="subtle" />
            </div>
          </div>

          <section className="m-edited">
            <div className="m-edited-head">
              <span className="m-icon-tile">
                <Icon src={fileCode14} size={14} />
              </span>
              <span className="m-edited-text">
                <span className="m-step-strong">Edited 2 files</span>
                <span className="m-mono m-changes">
                  <span className="m-added">+38</span> <span className="m-removed">−8</span>
                </span>
              </span>
            </div>
            <div className="m-files">
              <div className="m-file">
                <span className="m-mono m-path">
                  <span className="m-subtle">src/rpc/</span>transport.ts
                </span>
                <span className="m-spacer" />
                <span className="m-mono m-changes">
                  <span className="m-added">+14</span> <span className="m-removed">−4</span>
                </span>
              </div>
              <div className="m-diff m-mono">
                <div className="m-line m-hunk">
                  <span className="m-gutter" />
                  <span className="m-sign" />
                  <span>@@ -38,9 +38,19 @@ export class Transport</span>
                </div>
                {DIFF.map((l, i) => (
                  <div key={i} className="m-line">
                    <span className="m-gutter">{l.n}</span>
                    <span className="m-sign">{l.sign}</span>
                    <span className="m-code">{l.code}</span>
                  </div>
                ))}
              </div>
              <div className="m-file m-file-last">
                <span className="m-mono m-path">
                  <span className="m-subtle">src/agent/</span>stream.ts
                </span>
                <span className="m-spacer" />
                <span className="m-mono m-changes">
                  <span className="m-added">+24</span> <span className="m-removed">−4</span>
                </span>
              </div>
            </div>
          </section>

          <p className="m-body">
            The stream now reaches the client before the tool finishes. Next I want to run the cancellation and retry
            tests on <span className="m-mono m-inline-code">devbox-01</span>.
          </p>
        </div>

        <div className="m-above-composer">
          <button type="button" className="m-scroll-bottom" aria-label="Scroll to bottom">
            <Icon src={arrowDown} size={14} />
          </button>
        </div>

        <div className="m-composer">
          <div className="m-context">
            <button type="button" className="m-ghost m-chip m-subtle">
              <Icon src={folderOpen14} size={14} />
              reflection / harness
              <Icon src={chevronDownComposer} size={10} />
            </button>
            <button type="button" className="m-chip m-chip-raised">
              <Icon src={server} size={14} />
              devbox-01
              <Icon src={chevronDownComposer} size={10} />
            </button>
            <span className="m-spacer" />
            <span className="m-branch m-subtle">
              <Icon src={codeFork} size={14} />
              <span className="m-mono">tool-streaming</span>
            </span>
          </div>

          <div className={focused ? 'm-input m-input-focused' : 'm-input'}>
            <textarea
              className="m-textarea"
              placeholder="Follow up…   $ for skills · ⌘R for history"
              rows={2}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
            <div className="m-toolbar">
              <button type="button" className="m-ghost m-icon-btn m-icon-btn-sm" aria-label="Attach">
                <Icon src={plus} size={16} />
              </button>
              <button type="button" className="m-ghost m-chip m-subtle">
                <Icon src={shieldCheck} size={14} />
                Manual approval
              </button>
              <span className="m-spacer" />
              <button type="button" className="m-ghost m-chip">
                <span className="m-step-strong">gpt-5.6-sol</span>
                <span className="m-subtle">High</span>
                <Icon src={chevronDownComposer} size={10} />
              </button>
              <button type="button" className="m-send" aria-label="Send">
                <Icon src={arrowUp} size={14} />
              </button>
            </div>
          </div>

          <div className="m-status">
            <span>42% context · 84k</span>
            <span>38 tok/s</span>
            <span className="m-spacer" />
            <span>3 changes · +42 −8</span>
          </div>
        </div>
      </main>
    </div>
  )
}
