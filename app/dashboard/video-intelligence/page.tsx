'use client'

import { SparklesIcon } from '@heroicons/react/24/outline'
import { Eye, Zap, TrendingUp, Clock, RefreshCcw, Shield, Scissors } from 'lucide-react'
import { useRef, useState } from 'react'
import { useRouter } from "next/navigation"
import { useEffect} from "react"
import { useParams } from "next/navigation"
const STATS = [
  { label: 'Frames Analyzed', value: '2.4M', color: '#38BDF8' },
  { label: 'Scenes Detected', value: '18,392', color: '#8B5CF6' },
  { label: 'Highlight Reels', value: '284', color: '#10b981' },
  { label: 'Avg. Analysis Time', value: '3.1s', color: '#f59e0b' },
]

const FEATURES = [
  { icon: Eye, title: 'Frame-by-Frame Analysis', desc: 'ML models scan every frame for objects, faces, and emotional arcs in real-time.' },
  { icon: Zap, title: 'Auto Highlight Reel', desc: 'Top-scoring moments are auto-compiled into a shareable reel.' },
  { icon: TrendingUp, title: 'Engagement Scoring', desc: 'Each scene is scored by predicted viewer retention and emotional impact.' },
  { icon: Clock, title: 'Scene Segmentation', desc: 'Smart boundaries split your video into logical chapters automatically.' },
]

// ── helpers ────────────────────────────────────────────────────────────────────

function getScoreColor(score: number) {
  if (score >= 80) return { text: '#22c55e', glow: 'rgba(34,197,94,0.55)', border: 'rgba(34,197,94,0.5)' }
  if (score >= 60) return { text: '#f59e0b', glow: 'rgba(245,158,11,0.55)', border: 'rgba(245,158,11,0.5)' }
  return { text: '#ef4444', glow: 'rgba(239,68,68,0.55)', border: 'rgba(239,68,68,0.5)' }
}

function getRecommendationStyle(rec: string) {
  switch (rec.toLowerCase()) {
    case 'highlight': return { bg: 'rgba(245,158,11,0.18)', border: '1px solid rgba(245,158,11,0.45)', color: '#f59e0b' }
    case 'keep':      return { bg: 'rgba(34,197,94,0.18)',  border: '1px solid rgba(34,197,94,0.45)',  color: '#22c55e' }
    case 'trim':      return { bg: 'rgba(239,68,68,0.18)',  border: '1px solid rgba(239,68,68,0.45)',  color: '#ef4444' }
    case 'cut':       return { bg: 'rgba(239,68,68,0.18)',  border: '1px solid rgba(239,68,68,0.45)',  color: '#ef4444' }
    default:          return { bg: 'rgba(139,92,246,0.18)', border: '1px solid rgba(139,92,246,0.45)', color: '#a78bfa' }
  }
}

// Circular progress ring for engagement score
function CircularProgress({ score, size = 140 }: { score: number; size?: number }) {
  const r = (size / 2) - 14
  const circ = 2 * Math.PI * r
  const progress = circ - (score / 100) * circ
  const { text: scoreColor, glow } = getScoreColor(score)

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={10} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={scoreColor}
          strokeWidth={10}
          strokeDasharray={circ}
          strokeDashoffset={progress}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${glow})` }}
        />
      </svg>
      <div style={{ textAlign: 'center', zIndex: 1 }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{score}%</div>
      </div>
    </div>
  )
}

export default function VideoIntelligencePage() {
    const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadedKey, setUploadedKey] = useState<string | null>(null)

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    setLoading(true)

    try {
      const res = await fetch("/api/upload-video", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

    if (data.videoId) {
  router.push(`/dashboard/video-intelligence/${data.videoId}`)
     }else {
        alert("Upload failed")
      }
    } catch (err) {
      alert("Something went wrong")
    }

    setLoading(false)
  }

  /* ---------------- MOCK RESULT UI (until AWS analysis endpoint ready) ---------------- */

  const mockScenes = [
    {
      timestamp: "0:00–0:18",
      score: 92,
      recommendation: "Highlight",
      privacy: "Clear",
      reasoning: "Strong hook with direct address. High retention opener.",
      composition: "Rule of thirds, eye-level, good lighting contrast",
    },
    {
      timestamp: "0:18–0:52",
      score: 78,
      recommendation: "Keep",
      privacy: "Clear",
      reasoning: "Solid value delivery with clear visual aids. Maintains attention.",
      composition: "Medium shot, screen share with face cam overlay",
    },
    {
      timestamp: "0:52–1:35",
      score: 65,
      recommendation: "Trim",
      privacy: "Clear",
      reasoning: "Lengthy explanation could be condensed. Engagement dip detected.",
      composition: "Static wide shot, minimal visual variety",
    },
    {
      timestamp: "1:35–2:10",
      score: 88,
      recommendation: "Highlight",
      privacy: "Clear",
      reasoning: "Strong re-engagement moment. High viewer return predicted.",
      composition: "Eye-level close-up, warm lighting, direct address",
    },
    {
      timestamp: "2:10–3:05",
      score: 45,
      recommendation: "Cut",
      privacy: "Clear",
      reasoning: "Repetitive content. Viewer drop-off zone identified.",
      composition: "Wide shot, low energy, flat lighting",
    },
    {
      timestamp: "3:05–3:48",
      score: 82,
      recommendation: "Keep",
      privacy: "Clear",
      reasoning: "Tutorial segment with clear steps. High save-rate predicted.",
      composition: "Screen recording with cursor highlights",
    },
    {
      timestamp: "3:48–4:32",
      score: 90,
      recommendation: "Highlight",
      privacy: "Clear",
      reasoning: "Strong CTA with social proof. Excellent close.",
      composition: "Eye-level close-up, warm lighting, direct address",
    },
  ]

  const avgScore =
    Math.round(mockScenes.reduce((a, b) => a + b.score, 0) / mockScenes.length)

  const mockThumbnails = [
    { score: 87, frame: "0:05", desc: "Expressive face + text overlay potential" },
    { score: 92, frame: "1:38", desc: "Peak emotion moment, high contrast, rule of thirds" },
    { score: 78, frame: "4:20", desc: "Clean composition, brand-consistent backdrop" },
  ]

  const highlights = mockScenes.filter(s => s.score < 60)
  const improvements = [
    "Cut scene 5 (2:10–3:05) to improve pacing — saves 55s",
    "Trim scene 3 by 20s — tighten the explanation",
    "Use frame at 1:38 as primary thumbnail — highest CTR score",
    "Add B-roll during scene 3 to boost visual engagement",
  ]

  /* ---------------- UPLOAD SCREEN ---------------- */

  if (!uploadedKey) {
    return (
      <div className="space-y-8 max-w-6xl">

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.25)' }}>
            <SparklesIcon style={{ width: 22, height: 22, color: '#38BDF8' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Video Intelligence</h1>
            <p className="text-sm" style={{ color: '#A1A1AA' }}>
              Deep AI analysis of every frame, scene, and moment
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {STATS.map(s => (
            <div key={s.label} className="glass-card p-5">
              <div className="text-xs mb-2" style={{ color: '#A1A1AA' }}>{s.label}</div>
              <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Upload Section */}
        <div className="glass-card p-8 flex flex-col items-center justify-center text-center"
          style={{ minHeight: 200, borderStyle: 'dashed', borderColor: 'rgba(56,189,248,0.3)' }}>

          <SparklesIcon style={{ width: 40, height: 40, color: 'rgba(56,189,248,0.5)', marginBottom: 16 }} />

          <h3 className="text-lg font-semibold mb-2">Upload a video to analyze</h3>

          <p className="text-sm mb-6" style={{ color: '#A1A1AA', maxWidth: 400 }}>
            Drop your raw footage here. Our AI will scan every frame in seconds.
          </p>

          <input
            type="file"
            accept="video/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          <button
            onClick={handleButtonClick}
            disabled={loading}
            className="glow-btn px-8 py-3 text-white text-sm font-semibold"
          >
            {loading ? "Uploading..." : "Start Analysis"}
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map(f => (
            <div key={f.title} className="glass-card p-6 flex gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(56,189,248,0.10)', border: '1px solid rgba(56,189,248,0.2)' }}>
                <f.icon size={20} style={{ color: '#38BDF8' }} />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm" style={{ color: '#A1A1AA', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    )
  }

  /* ---------------- RESULTS SCREEN (PREMIUM UI) ---------------- */

  const glassBg = 'rgba(18,14,40,0.7)'
  const glassBorder = '1px solid rgba(139,92,246,0.2)'

  return (
    <div style={{
      maxWidth: 1100,
      color: '#e2e8f0',
      fontFamily: 'Inter, sans-serif',
    }}>

      {/* ── Page header ─────────────────────────────── */}
      <div className="flex items-center gap-3 mb-6">
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: 'rgba(139,92,246,0.15)',
          border: '1px solid rgba(139,92,246,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Video Intelligence Engine</h1>
          <p style={{ color: '#94a3b8', fontSize: 13 }}>Upload a video or paste a link to analyze scenes, engagement, and find the best thumbnails</p>
        </div>
      </div>

      {/* ── Intelligence Report header card ─────────── */}
      <div style={{
        background: glassBg,
        border: glassBorder,
        borderRadius: 20,
        padding: '20px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
        backdropFilter: 'blur(16px)',
        boxShadow: '0 0 0 1px rgba(139,92,246,0.1), 0 8px 32px rgba(0,0,0,0.4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'rgba(139,92,246,0.2)',
            border: '1px solid rgba(139,92,246,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17 }}>Intelligence Report</div>
            <div style={{ color: '#a78bfa', fontSize: 13, marginTop: 2 }}>Confidence Score: 94%</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#94a3b8', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Duration</div>
            <div style={{ fontWeight: 700, fontSize: 20 }}>4:32</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#94a3b8', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Resolution</div>
            <div style={{ fontWeight: 700, fontSize: 20 }}>1920×1080</div>
          </div>
          <button
            onClick={() => setUploadedKey(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 12,
              background: 'transparent',
              border: '1px solid rgba(139,92,246,0.45)',
              color: '#c4b5fd', fontWeight: 600, fontSize: 13,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(139,92,246,0.15)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <RefreshCcw size={14} />
            New Analysis
          </button>
        </div>
      </div>

      {/* ── Bento grid ──────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 200px 1fr',
        gap: 18,
        marginBottom: 32,
      }}>

        {/* Media Player */}
        <div style={{
          background: glassBg,
          border: glassBorder,
          borderRadius: 20,
          padding: 20,
          backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
            </svg>
            <span style={{ fontWeight: 600, fontSize: 14, color: '#c4b5fd' }}>Media Player</span>
          </div>
          <div style={{
            background: '#000',
            borderRadius: 12,
            minHeight: 260,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, color: '#94a3b8', fontSize: 13 }}>
            <Scissors size={14} style={{ color: '#a78bfa' }} />
            <span>Multi-Segment Trimming</span>
          </div>
        </div>

        {/* Avg Engagement circle */}
        <div style={{
          background: glassBg,
          border: glassBorder,
          borderRadius: 20,
          padding: 20,
          backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 16,
        }}>
          <CircularProgress score={avgScore} size={140} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 8 }}>
              AVG ENGAGEMENT
            </div>
            <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6, textAlign: 'center' }}>
              Overall viewer retention prediction based on scene composition.
            </div>
          </div>
        </div>

        {/* AI Deletions + Highlights */}
        <div style={{
          background: glassBg,
          border: glassBorder,
          borderRadius: 20,
          padding: 20,
          backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          display: 'flex', flexDirection: 'column', gap: 20,
        }}>
          {/* Deletions */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px rgba(239,68,68,0.7)' }} />
              <span style={{ fontWeight: 700, fontSize: 14 }}>Recommended AI Deletions</span>
            </div>
            {highlights.length === 0 ? (
              <div style={{
                background: 'rgba(139,92,246,0.1)',
                border: '1px solid rgba(139,92,246,0.2)',
                borderRadius: 10,
                padding: '12px 14px',
                fontSize: 13,
                color: '#a78bfa',
                fontStyle: 'italic',
              }}>
                No poor engagement sections detected.
              </div>
            ) : (
              highlights.map((s, i) => (
                <div key={i} style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: 10, padding: '10px 14px', marginBottom: 8,
                  fontSize: 13, color: '#fca5a5',
                }}>
                  {s.timestamp} — {s.reasoning}
                </div>
              ))
            )}
          </div>

          <div style={{ height: 1, background: 'rgba(139,92,246,0.15)' }} />

          {/* Highlights */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px rgba(34,197,94,0.7)' }} />
              <span style={{ fontWeight: 700, fontSize: 14 }}>Highlights &amp; Improvements</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {improvements.map((tip, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 1, flexShrink: 0 }}>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span style={{ fontSize: 12.5, color: '#cbd5e1', lineHeight: 1.55 }}>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Scene-by-Scene Timeline ──────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
          <h2 style={{ fontWeight: 700, fontSize: 17 }}>Scene-by-Scene Timeline</h2>
        </div>

        <div style={{
          background: glassBg,
          border: glassBorder,
          borderRadius: 20,
          padding: '28px 28px',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          <div style={{ position: 'relative' }}>
            {/* Vertical glowing connector line */}
            <div style={{
              position: 'absolute',
              left: 24,
              top: 24,
              bottom: 24,
              width: 2,
              background: 'linear-gradient(to bottom, rgba(139,92,246,0.6), rgba(56,189,248,0.15))',
              boxShadow: '0 0 8px rgba(139,92,246,0.4)',
            }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {mockScenes.map((scene, idx) => {
                const colors = getScoreColor(scene.score)
                const pillStyle = getRecommendationStyle(scene.recommendation)

                return (
                  <div key={idx} style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                    {/* Score badge */}
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                      background: `rgba(0,0,0,0.5)`,
                      border: `2px solid ${colors.border}`,
                      boxShadow: `0 0 16px ${colors.glow}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: 14,
                      color: colors.text,
                      position: 'relative', zIndex: 1,
                    }}>
                      {scene.score}
                    </div>

                    {/* Scene card */}
                    <div style={{
                      flex: 1,
                      background: 'rgba(15,10,35,0.6)',
                      border: '1px solid rgba(139,92,246,0.15)',
                      borderRadius: 14,
                      padding: '16px 20px',
                    }}>
                      {/* Top row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                        <span style={{
                          fontWeight: 700, fontSize: 14,
                          background: 'rgba(139,92,246,0.2)',
                          border: '1px solid rgba(139,92,246,0.3)',
                          borderRadius: 8, padding: '4px 12px',
                          color: '#c4b5fd',
                        }}>
                          {scene.timestamp}
                        </span>
                        <span style={{
                          fontWeight: 700, fontSize: 12,
                          background: pillStyle.bg,
                          border: pillStyle.border,
                          borderRadius: 20, padding: '4px 14px',
                          color: pillStyle.color,
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                        }}>
                          {scene.recommendation}
                        </span>
                      </div>

                      {/* Privacy row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <Shield size={13} style={{ color: '#22c55e' }} />
                        <span style={{ color: '#94a3b8', fontSize: 13 }}>Privacy {scene.privacy}</span>
                      </div>

                      {/* Reasoning */}
                      <div style={{ fontSize: 14, color: '#e2e8f0', marginBottom: 10, lineHeight: 1.55 }}>
                        {scene.reasoning}
                      </div>

                      {/* Divider */}
                      <div style={{ height: 1, background: 'rgba(139,92,246,0.12)', marginBottom: 10 }} />

                      {/* Composition */}
                      <div style={{ fontSize: 12.5, color: '#64748b' }}>
                        ↳ {scene.composition}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Thumbnail Analysis ───────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <h2 style={{ fontWeight: 700, fontSize: 17 }}>Thumbnail Analysis (Engagement Drops)</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {mockThumbnails.map((thumb, i) => {
            const colors = getScoreColor(thumb.score)
            return (
              <div key={i} style={{
                background: glassBg,
                border: `1px solid ${colors.border}`,
                borderRadius: 20,
                padding: '28px 20px',
                backdropFilter: 'blur(16px)',
                boxShadow: `0 0 24px ${colors.glow}, 0 8px 32px rgba(0,0,0,0.4)`,
                textAlign: 'center',
              }}>
                {/* Big CTR score circle */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
                  <div style={{
                    width: 90, height: 90, borderRadius: '50%',
                    background: `radial-gradient(circle at 40% 35%, rgba(139,92,246,0.35), rgba(88,28,135,0.7))`,
                    border: `2px solid ${colors.border}`,
                    boxShadow: `0 0 24px ${colors.glow}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 26, fontWeight: 800, color: colors.text }}>{thumb.score}%</span>
                  </div>
                </div>

                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
                  Frame @ {thumb.frame}
                </div>
                <div style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.55 }}>
                  {thumb.desc}
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}