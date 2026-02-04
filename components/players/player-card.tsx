
import React from 'react';
import { NBAPlayer, getTeamLogoUrl, getModernTeam } from '@/lib/nba-data';

interface PlayerCardProps {
  player: NBAPlayer;
}

export function PlayerCard({ player }: PlayerCardProps) {
  // Determine major awards to display as badges
  const badges = [];
  if (player.mvp) badges.push({ label: 'MVP', color: 'bg-yellow-500' });
  if (player.champion) badges.push({ label: 'CHAMP', color: 'bg-yellow-400' });
  if (player.allStar) badges.push({ label: 'ALL-STAR', color: 'bg-blue-500' });
  if (player.dpoy) badges.push({ label: 'DPOY', color: 'bg-red-500' });
  if (player.roy) badges.push({ label: 'ROY', color: 'bg-green-500' });

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-sm overflow-hidden flex flex-col h-full shadow-lg hover:border-blue-500 transition-colors duration-200">
      {/* Header / Photo Area */}
      <div className="relative h-48 bg-gradient-to-b from-slate-800 to-slate-900 flex items-center justify-center p-4 overflow-hidden group">
         {/* Background Team Logo Pattern (Optional nice touch) */}
         <div className="absolute inset-0 opacity-5 flex flex-wrap justify-center items-center content-center pointer-events-none">
            {player.teams[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={getTeamLogoUrl(player.teams[0])} alt="" className="w-32 h-32 grayscale" />
            )}
         </div>

        {/* Player Headshot */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://cdn.nba.com/headshots/nba/latest/1040x760/${player.nbaId || player.id}.png`}
          onError={(e) => {
            // Fallback for missing photos (legacy players)
            // Use their first team logo as fallback or a silhouette
            e.currentTarget.src = getTeamLogoUrl(player.teams[0] || 'NBA'); 
            e.currentTarget.className = "w-24 h-24 object-contain opacity-80"
          }}
          alt={player.name}
          className="relative z-10 h-full w-auto object-contain drop-shadow-xl transition-transform group-hover:scale-105"
        />
        
        {/* Badges Overlay */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 z-20">
          {badges.map((badge, idx) => (
            <span key={idx} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm text-white ${badge.color} shadow-sm border border-black/20`}>
              {badge.label}
            </span>
          ))}
        </div>
      </div>

      {/* Info Body */}
      <div className="p-3 flex-1 flex flex-col">
        <h3 className="text-white text-lg font-bold font-oswald leading-tight uppercase truncate">
          {player.name}
        </h3>
        
        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 mb-3">
             <span>{(player.position || 'N/A').split(/[-/]/)[0]}</span>
             <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
             <span>{player.active ? 'Active' : 'Retired'}</span>
             {player.country && player.country !== 'USA' && (
                 <>
                    <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                    <span>{player.country}</span>
                 </>
             )}
        </div>

        {/* Team History Strip */}
        <div className="mt-auto">
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1.5">Career History</div>
            <div className="flex flex-wrap gap-1">
                {Array.from(new Set(player.teams.map(t => getModernTeam(t)))).map((team) => (
                    <div key={team} className="w-6 h-6 bg-white p-0.5 rounded-sm flex items-center justify-center border border-slate-300" title={team}>
                         {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={getTeamLogoUrl(team)} 
                            alt={team} 
                            className="w-full h-full object-contain"
                        />
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
