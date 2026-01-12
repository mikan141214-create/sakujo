'use client'

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'

interface SkillRadarProps {
  skills: {
    spike: number
    block: number
    receive: number
    serve: number
    toss: number
    connect: number
    decision: number
  }
}

export function SkillRadar({ skills }: SkillRadarProps) {
  const data = [
    { skill: 'スパイク', value: skills.spike },
    { skill: 'ブロック', value: skills.block },
    { skill: 'レシーブ', value: skills.receive },
    { skill: 'サーブ', value: skills.serve },
    { skill: 'トス', value: skills.toss },
    { skill: 'つなぎ', value: skills.connect },
    { skill: '判断', value: skills.decision },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="skill" />
        <PolarRadiusAxis angle={90} domain={[0, 100]} />
        <Radar
          name="スキル"
          dataKey="value"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.6}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
