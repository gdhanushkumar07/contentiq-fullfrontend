'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MusicalNoteIcon } from '@heroicons/react/24/outline'
import { Sparkles, Music2, Lightbulb, Play } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Track {
  title: string
  genre: string
  bpm: number
  duration: string
  match: number
}

interface BGMSegment {
  timestamp: string
  energyPct: number
  mood: string
  suggestedStyle: string
  tracks: Track[]
}

interface BGMPlan {
  confidence: number
  segments: BGMSegment[]
  recommendations: string[]
}





// ── Helpers ────────────────────────────────────────────────────────────────────

function energyStyle(pct: number): { bar: string; text: string } {
  if (pct >= 75) return { bar: '#ef4444', text: '#f87171' }
  if (pct >= 45) return { bar: '#eab308', text: '#fbbf24' }
  return { bar: '#3b82f6', text: '#60a5fa' }
}

function matchColor(match: number): { bg: string; text: string; border: string } {
  if (match >= 90) return { bg: 'rgba(34,197,94,0.12)', text: '#4ade80', border: 'rgba(34,197,94,0.3)' }
  if (match >= 80) return { bg: 'rgba(139,92,246,0.14)', text: '#c4b5fd', border: 'rgba(139,92,246,0.35)' }
  return { bg: 'rgba(245,158,11,0.12)', text: '#fbbf24', border: 'rgba(245,158,11,0.3)' }
}

// ── Skeleton shimmer ───────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card p-6"
      style={{ borderRadius: 16 }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[55, 90, 70].map((w, i) => (
          <div
            key={i}
            style={{
              height: i === 0 ? 14 : 10,
              width: `${w}%`,
              borderRadius: 8,
              background: 'linear-gradient(90deg, rgba(139,92,246,0.07) 0%, rgba(139,92,246,0.18) 50%, rgba(139,92,246,0.07) 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}

// ── Track row ──────────────────────────────────────────────────────────────────

function TrackRow({ track, isLast }: { track: Track; isLast: boolean }) {
  const mc = matchColor(track.match)
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        borderRadius: 10,
        background: hovered ? 'rgba(139,92,246,0.07)' : 'transparent',
        borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.04)',
        transition: 'background 0.18s ease',
        cursor: 'default',
      }}
    >
      {/* Play button */}
      <button
        style={{
          width: 30,
          height: 30,
          borderRadius: '50%',
          background: hovered ? 'rgba(139,92,246,0.25)' : 'rgba(139,92,246,0.12)',
          border: '1px solid rgba(139,92,246,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'all 0.18s ease',
        }}
        title="Preview"
      >
        <Play size={11} fill="#a78bfa" color="#a78bfa" style={{ marginLeft: 1 }} />
      </button>

      {/* Title + meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13.5, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {track.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 2 }}>
          <span style={{ fontSize: 11.5, color: '#64748b' }}>{track.genre}</span>
          <span style={{ fontSize: 11.5, color: '#475569' }}>·</span>
          <span style={{ fontSize: 11.5, color: '#64748b' }}>{track.bpm} BPM</span>
          <span style={{ fontSize: 11.5, color: '#475569' }}>·</span>
          <span style={{ fontSize: 11.5, color: '#64748b' }}>{track.duration}</span>
        </div>
      </div>

      {/* Match badge */}
      <span
        style={{
          fontSize: 11.5,
          fontWeight: 700,
          padding: '3px 9px',
          borderRadius: 20,
          background: mc.bg,
          color: mc.text,
          border: `1px solid ${mc.border}`,
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        {track.match}% match
      </span>

      {/* Preview label */}
      <span
        style={{
          fontSize: 11.5,
          fontWeight: 600,
          padding: '3px 10px',
          borderRadius: 8,
          background: hovered ? 'rgba(139,92,246,0.18)' : 'rgba(139,92,246,0.08)',
          color: '#a78bfa',
          border: '1px solid rgba(139,92,246,0.25)',
          flexShrink: 0,
          transition: 'all 0.18s ease',
          cursor: 'pointer',
        }}
      >
        Preview
      </span>
    </div>
  )
}

// ── Segment card ───────────────────────────────────────────────────────────────

function SegmentCard({ seg, index, delay }: { seg: BGMSegment; index: number; delay: number }) {
  const { bar: barColor, text: textColor } = energyStyle(seg.energyPct)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay }}
      className="glass-card"
      style={{ borderRadius: 16, overflow: 'hidden' }}
    >
      {/* ── Segment info ── */}
      <div style={{ padding: '18px 22px' }}>

        {/* Top row: Segment pill + timestamp | Energy */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              fontSize: 11.5, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
              background: 'rgba(139,92,246,0.22)', border: '1px solid rgba(139,92,246,0.4)',
              color: '#c4b5fd', letterSpacing: '0.02em', whiteSpace: 'nowrap',
            }}>
              Segment {index + 1}
            </span>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#e2e8f0' }}>{seg.timestamp}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>Energy</span>
            <div style={{ width: 100, height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${seg.energyPct}%` }}
                transition={{ duration: 0.7, delay, ease: 'easeOut' }}
                style={{ position: 'absolute', inset: 0, background: barColor, borderRadius: 99, boxShadow: `0 0 8px ${barColor}88` }}
              />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: textColor, minWidth: 34, textAlign: 'right' }}>{seg.energyPct}%</span>
          </div>
        </div>

        {/* MOOD | SUGGESTED STYLE */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>Mood</div>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: '#f1f5f9' }}>{seg.mood}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>Suggested Style</div>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: '#f1f5f9' }}>{seg.suggestedStyle}</div>
          </div>
        </div>

        {/* ElevenLabs placeholder */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 12,
          display: 'flex', alignItems: 'center', gap: 7, color: '#475569', fontSize: 12,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
          Add ElevenLabs API key for audio generation
        </div>
      </div>

      {/* ── Matching Tracks ── */}
      <div style={{
        borderTop: '1px solid rgba(139,92,246,0.12)',
        background: 'rgba(139,92,246,0.04)',
      }}>
        {/* Section header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          padding: '12px 22px 8px',
        }}>
          <Music2 size={13} style={{ color: '#7c3aed' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Matching Tracks
          </span>
          <span style={{
            fontSize: 10.5, fontWeight: 600, padding: '1px 7px', borderRadius: 20,
            background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.25)',
          }}>
            {seg.tracks.length}
          </span>
        </div>

        {/* Track rows */}
        <div style={{ padding: '0 8px 8px' }}>
          {seg.tracks.map((track, i) => (
            <TrackRow key={track.title} track={track} isLast={i === seg.tracks.length - 1} />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function BGMSuggestorPage() {
  const [transcript, setTranscript] = useState('')
  const [loading, setLoading]       = useState(false)
  const [plan, setPlan]             = useState<BGMPlan | null>(null)

 const handleGenerate = async () => {
  if (!transcript.trim()) return

  setLoading(true)
  setPlan(null)

  try {
    const res = await fetch("/api/bgm-suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data?.error ?? "Failed to generate BGM plan")
    }

    // Route returns { plan: BGMPlan } — already parsed, no JSON.parse needed
    setPlan(data.plan as BGMPlan)

  } catch (error) {
    console.error("Error generating BGM plan:", error)
    alert(error instanceof Error ? error.message : "Something went wrong. Please try again.")
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="space-y-8 max-w-4xl">

      {/* ── Page header ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(139,92,246,0.14)', border: '1px solid rgba(139,92,246,0.3)' }}
          >
            <MusicalNoteIcon style={{ width: 22, height: 22, color: '#a78bfa' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI BGM Strategy Generator</h1>
            <p className="text-sm" style={{ color: '#A1A1AA' }}>
              Paste your video transcript — our AI builds a scene-by-scene adaptive music plan
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Transcript input card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.07 }}
        className="glass-card p-6"
        style={{ borderRadius: 20 }}
      >
        <label htmlFor="transcript" className="block text-sm font-semibold mb-3" style={{ color: '#c4b5fd' }}>
          Video Transcript
        </label>
        <textarea
          id="transcript"
          value={transcript}
          onChange={e => setTranscript(e.target.value)}
          placeholder={"Paste your full video script or transcript here…\n\nExample:\n[0:00] Hey everyone, today I'm going to show you how to 10x your content workflow using AI tools.\n[0:18] The biggest problem creators face is spending hours editing when they should be creating…"}
          rows={10}
          style={{
            width: '100%',
            background: 'rgba(139,92,246,0.06)',
            border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: 14,
            padding: '14px 16px',
            color: '#e2e8f0',
            fontSize: 13.5,
            lineHeight: 1.7,
            resize: 'vertical',
            outline: 'none',
            fontFamily: 'Inter, sans-serif',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.55)')}
          onBlur={e  => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.2)')}
        />
        <div className="flex items-center justify-between mt-4">
          <span style={{ fontSize: 12, color: '#64748b' }}>
            {transcript.trim().split(/\s+/).filter(Boolean).length} words
          </span>
          <button
            onClick={handleGenerate}
            disabled={loading || !transcript.trim()}
            className="flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-xl"
            style={{
              background: transcript.trim() && !loading ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'rgba(139,92,246,0.15)',
              color: transcript.trim() && !loading ? '#fff' : '#7c3aed',
              border: '1px solid rgba(139,92,246,0.4)',
              cursor: transcript.trim() && !loading ? 'pointer' : 'not-allowed',
              boxShadow: transcript.trim() && !loading ? '0 0 20px rgba(139,92,246,0.35)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <Sparkles size={15} />
            {loading ? 'Generating plan…' : 'Generate BGM Plan'}
          </button>
        </div>
      </motion.div>

      {/* ── Loading skeletons ── */}
      <AnimatePresence>
        {loading && (
          <motion.div
            key="skeletons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <p className="text-sm font-medium" style={{ color: '#a78bfa' }}>
              ✦ Analysing transcript &amp; composing your music strategy…
            </p>
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
            <style>{`
              @keyframes shimmer {
                0%   { background-position: -200% 0; }
                100% { background-position:  200% 0; }
              }
            `}</style>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Results ── */}
      <AnimatePresence>
        {plan && !loading && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {/* BGM Plan header with confidence bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 6, paddingBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Music2 size={16} style={{ color: '#a78bfa' }} />
                <span style={{ fontWeight: 700, fontSize: 15, color: '#f1f5f9' }}>BGM Plan</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>Confidence</span>
                <div style={{ width: 110, height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${plan.confidence}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, #7c3aed, #a855f7)', borderRadius: 99, boxShadow: '0 0 8px rgba(139,92,246,0.6)' }}
                  />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#c4b5fd' }}>{plan.confidence}%</span>
              </div>
            </motion.div>

            {/* Segment cards */}
            <div className="space-y-3">
              {plan.segments.map((seg, idx) => (
                <SegmentCard key={idx} seg={seg} index={idx} delay={idx * 0.07} />
              ))}
            </div>

            {/* Recommendations card */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.38, delay: plan.segments.length * 0.07 + 0.1 }}
              className="glass-card"
              style={{ borderRadius: 16, padding: '20px 22px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Lightbulb size={16} style={{ color: '#fbbf24' }} />
                <span style={{ fontWeight: 700, fontSize: 14.5, color: '#f1f5f9' }}>Recommendations</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {plan.recommendations.map((rec, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ marginTop: 3, flexShrink: 0 }}>
                      <polygon points="5 3 19 12 5 21 5 3" fill="#a78bfa" />
                    </svg>
                    <span style={{ fontSize: 13.5, color: '#cbd5e1', lineHeight: 1.55 }}>{rec}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Footer note */}
            <p className="text-xs text-center pb-4" style={{ color: '#475569' }}>
              BGM strategy generated by AI · Timings are approximate · Adjust per your final cut
            </p>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
