/**
 * PDCA Status Tool
 *
 * nkit-claude-code의 StatusService를 OpenCode 커스텀 도구로 이식한 제네릭 버전.
 * `.pdca-status.json`에 기능별 PDCA 단계/품질 게이트/반복 횟수/생성 파일을 영속화한다.
 */

import { tool, type ToolDefinition } from "@opencode-ai/plugin/tool"
import * as path from "path"
import * as fs from "fs"

const STATUS_FILE = ".pdca-status.json"
const PHASES = ["plan", "design", "do", "check", "iterate", "report"] as const

type FeatureState = {
  currentPhase: string
  completed: boolean
  iterationCount: number
  gates: Record<string, number>
  generatedFiles: string[]
  notes: string
  updatedAt: string
}

type StatusStore = {
  version: string
  updatedAt: string
  features: Record<string, FeatureState>
}

function statusPath(cwd: string): string {
  return path.join(cwd, STATUS_FILE)
}

function load(cwd: string): StatusStore {
  const p = statusPath(cwd)
  if (!fs.existsSync(p)) {
    return { version: "1.0.0", updatedAt: "", features: {} }
  }
  try {
    const store = JSON.parse(fs.readFileSync(p, "utf-8")) as StatusStore
    if (!store.features) store.features = {}
    return store
  } catch {
    // 손상된 파일: 빈 스토어로 폴백 (덮어쓰기 전 update 호출에서만 저장됨)
    return { version: "1.0.0", updatedAt: "", features: {} }
  }
}

function save(cwd: string, store: StatusStore, now: string): void {
  store.version = store.version || "1.0.0"
  store.updatedAt = now
  fs.writeFileSync(statusPath(cwd), JSON.stringify(store, null, 2) + "\n")
}

const pdcaStatusTool: ToolDefinition = tool({
  description:
    "PDCA 진행 상태를 .pdca-status.json에 읽고 쓴다. action=show로 전체 상태 조회, action=update로 특정 feature의 단계/게이트/반복/파일을 갱신. 각 PDCA 단계 종료 시 update를 호출해 상태를 영속화하라.",
  args: {
    action: tool.schema
      .enum(["show", "update"])
      .describe("show: 전체 상태 반환, update: feature 상태 갱신"),
    feature: tool.schema
      .string()
      .optional()
      .describe("대상 기능 ID (update 시 필수)"),
    phase: tool.schema
      .string()
      .optional()
      .describe("현재 단계 (plan/design/do/check/iterate/report)"),
    completed: tool.schema
      .boolean()
      .optional()
      .describe("기능 완료 여부 (report 통과 시 true)"),
    gates: tool.schema
      .record(tool.schema.string(), tool.schema.number())
      .optional()
      .describe("품질 게이트 점수, 예: {L1_codeQuality:92, L2_designMatch:95, L3_testMatch:93, L4_runtime:90}"),
    iterationCount: tool.schema
      .number()
      .optional()
      .describe("iterate 반복 횟수"),
    generatedFiles: tool.schema
      .array(tool.schema.string())
      .optional()
      .describe("생성/변경된 파일 경로 목록"),
    notes: tool.schema
      .string()
      .optional()
      .describe("특이사항/잔여 TODO"),
  },
  async execute(args, context) {
    const cwd = context.worktree || context.directory
    const now = new Date().toISOString()
    const store = load(cwd)

    if (args.action === "show") {
      const features = Object.entries(store.features)
      const rows = features.map(([id, s]) => {
        const phaseIdx = PHASES.indexOf(s.currentPhase as (typeof PHASES)[number])
        const marks = PHASES.map((ph, i) => {
          if (s.completed && ph === "report") return "✅"
          if (i < phaseIdx) return "✅"
          if (i === phaseIdx) return s.completed ? "✅" : "🔄"
          return "❌"
        })
        const g = s.gates || {}
        const gateStr = ["L1_codeQuality", "L2_designMatch", "L3_testMatch", "L4_runtime"]
          .map((k) => (g[k] != null ? g[k] : "-"))
          .join("/")
        return `  ${id.padEnd(16)} ${marks.join(" ")}  gates=${gateStr}  iter=${s.iterationCount || 0}`
      })
      return JSON.stringify({
        statusFile: STATUS_FILE,
        updatedAt: store.updatedAt,
        phases: PHASES,
        featureCount: features.length,
        table: rows.join("\n") || "(추적 중인 기능 없음)",
        features: store.features,
      })
    }

    // action === "update"
    if (!args.feature) {
      return JSON.stringify({ error: "update에는 feature가 필요합니다." })
    }
    const prev: FeatureState = store.features[args.feature] || {
      currentPhase: "plan",
      completed: false,
      iterationCount: 0,
      gates: {},
      generatedFiles: [],
      notes: "",
      updatedAt: now,
    }
    const next: FeatureState = {
      ...prev,
      currentPhase: args.phase ?? prev.currentPhase,
      completed: args.completed ?? prev.completed,
      iterationCount: args.iterationCount ?? prev.iterationCount,
      gates: { ...prev.gates, ...(args.gates || {}) },
      generatedFiles: args.generatedFiles
        ? Array.from(new Set([...prev.generatedFiles, ...args.generatedFiles]))
        : prev.generatedFiles,
      notes: args.notes ?? prev.notes,
      updatedAt: now,
    }
    store.features[args.feature] = next
    save(cwd, store, now)
    return JSON.stringify({ updated: args.feature, state: next })
  },
})

export default pdcaStatusTool
