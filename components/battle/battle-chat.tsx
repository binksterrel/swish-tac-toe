"use client"

import { useState, useEffect, useRef } from "react"
import { pusherClient } from "@/lib/pusher"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Send, MessageSquare, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"

interface ChatMessage {
  id: string
  player: 'host' | 'guest'
  playerName: string
  text: string
  timestamp: number
}

interface BattleChatProps {
  code: string
  role: 'host' | 'guest'
  playerName: string
  opponentName?: string
  isOpen?: boolean
  onToggle?: (open: boolean) => void
}

const QUICK_CHATS = [
    { emoji: "🏀", label: "Swish!" },
    { emoji: "🔥", label: "Fire!" },
    { emoji: "🫣", label: "Oof..." },
    { emoji: "🤔", label: "Hmm..." },
    { emoji: "👀", label: "Watching" },
    { emoji: "👋", label: "Hi!" },
    { emoji: "👏", label: "Nice!" },
    { emoji: "😂", label: "Haha" },
]

export function BattleChat({ code, role, playerName, opponentName, isOpen = false, onToggle }: BattleChatProps) {
  const { t } = useLanguage()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [open, setOpen] = useState(isOpen)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const QUICK_CHATS = [
    { emoji: "🏀", key: "swish" },
    { emoji: "🔥", key: "fire" },
    { emoji: "🫣", key: "oof" },
    { emoji: "🤔", key: "hmm" },
    { emoji: "👀", key: "watching" },
    { emoji: "👋", key: "hi" },
    { emoji: "👏", key: "nice" },
    { emoji: "😂", key: "haha" },
  ]

  // Subscribe to chat channel
  useEffect(() => {
    if (!code) return

    // Standardized channel name
    const channel = pusherClient.subscribe(`battle-${code}`)

    const handleMessage = (msg: ChatMessage) => {
      setMessages(prev => {
        // Prevent duplicate messages (from optimistic updates or double events)
        if (prev.some(m => m.id === msg.id)) return prev
        return [...prev, msg]
      })
    }

    channel.bind('chat-message', handleMessage)

    return () => {
      channel.unbind('chat-message', handleMessage)
      pusherClient.unsubscribe(`battle-${code}`)
    }
  }, [code])

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const message: ChatMessage = {
      id: `${Date.now()}-${Math.random()}`,
      player: role,
      playerName,
      text: input,
      timestamp: Date.now()
    }

    // Optimistic add
    setMessages(prev => [...prev, message])
    setInput("")

    try {
      await fetch('/api/battle/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, message })
      })
    } catch (e) {
      console.error("Failed to send message:", e)
    }
  }

  const sendQuickChat = async (item: { emoji: string, key: string }) => {
       const label = t(`battle.chat.quick_chats.${item.key}`)
       
       // Optimistic add for quick chat too
       const message: ChatMessage = {
        id: `${Date.now()}-${Math.random()}`,
        player: role,
        playerName,
        text: `${item.emoji} ${label}`,
        timestamp: Date.now()
       }
       setMessages(prev => [...prev, message])

       try {
          await fetch('/api/battle/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  code, 
                  role,
                  emoji: item.emoji,
                  message: label,
                  fullMessage: message // Pass full message to match manual send structure if needed by API
              })
          })
       } catch (e) {
           console.error(e)
       }
  }

  const toggleChat = (newOpen: boolean) => {
    setOpen(newOpen)
    onToggle?.(newOpen)
  }

  if (!open) {
    return (
      <div className="fixed bottom-4 left-4 z-40 flex flex-col gap-2 items-start">
          {/* Always Visible Quick Chat (Mini) */}
          <div className="flex gap-1 bg-black/50 p-1 rounded-full backdrop-blur-md border border-white/10 mb-2">
              {QUICK_CHATS.slice(0, 3).map(item => (
                  <button 
                    key={item.key}
                    onClick={() => sendQuickChat(item)}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/20 flex items-center justify-center text-lg transition-colors"
                    title={t(`battle.chat.quick_chats.${item.key}`)}
                  >
                      {item.emoji}
                  </button>
              ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleChat(true)}
            className="gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="text-xs uppercase">Chat</span>
            {messages.length > 0 && (
              <span className="ml-2 bg-nba-red text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {messages.length}
              </span>
            )}
          </Button>
      </div>
    )
  }

  return (
    <Card className="fixed bottom-4 left-4 z-50 w-80 h-[500px] bg-gray-900 border-gray-800 shadow-2xl flex flex-col animate-in slide-in-from-bottom-10">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-800 bg-black/50">
        <div>
          <h3 className="text-sm font-bold uppercase">{playerName} vs {opponentName || t('battle.opponent')}</h3>
          <p className="text-xs text-slate-400">{t('battle.chat.live_chat')}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleChat(false)}
          className="text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-black/20">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center">
            <p className="text-xs text-slate-500 uppercase">{t('battle.chat.no_messages')}</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-2 text-xs",
                msg.player === role ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[70%] px-3 py-2 rounded-lg break-words",
                  msg.player === role
                    ? "bg-nba-blue text-white rounded-br-none"
                    : "bg-gray-800 text-gray-100 rounded-bl-none"
                )}
              >
                {msg.player !== role && (
                  <p className="text-xs font-bold uppercase text-slate-400 mb-1">
                    {msg.playerName}
                  </p>
                )}
                <p>{msg.text}</p>
                <p className="text-xs opacity-60 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Chat Bar */}
      <div className="p-2 bg-gray-900/50 border-t border-gray-800 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {QUICK_CHATS.map(item => (
              <button
                key={item.key}
                onClick={() => sendQuickChat(item)}
                className="flex-shrink-0 px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-xs font-bold flex gap-1 items-center transition-colors"
              >
                  <span>{item.emoji}</span>
                  <span className="text-slate-300">{t(`battle.chat.quick_chats.${item.key}`)}</span>
              </button>
          ))}
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-3 bg-black/50 border-t border-gray-800">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder={t('battle.chat.say_something')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white text-sm h-9"
            maxLength={100}
          />
          <Button
            type="submit"
            disabled={!input.trim()}
            size="sm"
            className="bg-nba-blue hover:bg-blue-600 h-9 w-9 p-0"
            title={t('battle.chat.send')}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </Card>
  )
}
