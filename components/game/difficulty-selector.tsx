"use client"

import { useLanguage } from "@/contexts/language-context"
import { Segmented } from "./segmented"

interface DifficultySelectorProps {
  difficulty: "easy" | "medium" | "hard"
  onSelect: (difficulty: "easy" | "medium" | "hard") => void
  label?: string
}

export function DifficultySelector({ difficulty, onSelect, label = "Difficulté" }: DifficultySelectorProps) {
  const { t } = useLanguage()

  return (
    <Segmented
      label={label}
      value={difficulty}
      onChange={onSelect}
      options={[
        { value: "easy", label: t("game.diff_easy") },
        { value: "medium", label: t("game.diff_medium") },
        { value: "hard", label: t("game.diff_hard") },
      ]}
    />
  )
}
