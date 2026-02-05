"use client"

import { cn } from "@/lib/utils"
import { RankInfo } from "@/lib/ranking"
import { motion } from "framer-motion"

interface RankBadgeProps {
    rank: RankInfo
    size?: 'sm' | 'md' | 'lg' | 'xl'
    showLabel?: boolean
    className?: string
}

export function RankBadge({ rank, size = 'md', showLabel = true, className }: RankBadgeProps) {
    const Icon = rank.icon

    const sizeClasses = {
        sm: "w-6 h-6",
        md: "w-10 h-10",
        lg: "w-16 h-16",
        xl: "w-24 h-24"
    }

    const iconSizes = {
        sm: "w-3 h-3",
        md: "w-5 h-5",
        lg: "w-8 h-8",
        xl: "w-12 h-12"
    }

    return (
        <div className={cn("flex flex-col items-center gap-1", className)}>
            <div className={cn(
                "relative flex items-center justify-center rounded-full border bg-black/50 backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)]",
                sizeClasses[size],
                `border-${rank.color.split('-')[1]}-500/30`
            )}>
                {/* Glow Effect */}
                <div className={cn(
                    "absolute inset-0 rounded-full blur-md opacity-40",
                    `bg-gradient-to-br ${rank.gradient}`
                )} />
                
                {/* Icon */}
                <Icon className={cn(
                    "relative z-10 text-white drop-shadow-md", 
                    iconSizes[size],
                    rank.id === 'HOF' && "text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]"
                )} />
            </div>

            {showLabel && (
                <div className={cn(
                    "font-heading font-bold uppercase italic tracking-wider text-center",
                    size === 'sm' ? "text-[8px]" : size === 'md' ? "text-[10px]" : "text-sm",
                    `text-transparent bg-clip-text bg-gradient-to-r ${rank.gradient}`
                )}>
                    {rank.label}
                </div>
            )}
        </div>
    )
}
