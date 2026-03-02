'use client'

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

export default function VideoReportPage() {
  const { id } = useParams()
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    let interval: any

    const fetchData = async () => {
      const res = await fetch(`/api/video/${id}`)
      const result = await res.json()
      setData(result)

      if (result.status === "processing") {
        interval = setTimeout(fetchData, 2000)
      }
    }

    if (id) fetchData()

    return () => clearTimeout(interval)
  }, [id])

  if (!data) {
    return <div className="p-10 text-white">Loading...</div>
  }

  if (data.status === "processing") {
    return (
      <div className="p-10 text-white">
        AI is analyzing your video...
      </div>
    )
  }

  return (
    <div className="p-10 text-white">
      <h1 className="text-2xl font-bold mb-4">
        Engagement Score: {data.engagementScore}%
      </h1>

      <p>Confidence: {data.confidenceScore}%</p>
      <p>Duration: {data.duration}</p>
      <p>Resolution: {data.resolution}</p>

      <div className="mt-6">
        <h2 className="font-bold mb-2">Scenes</h2>
        {data.scenes?.map((scene: any, i: number) => (
          <div key={i} className="mb-3 p-3 border border-gray-700 rounded">
            {scene.start} - {scene.end} | Score: {scene.score}
            <div className="text-sm text-gray-400">
              {scene.feedback}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
