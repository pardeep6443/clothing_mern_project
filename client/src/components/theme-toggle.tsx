import React from 'react';
import { useTheme } from '@/contexts/theme-context';
import { Sun, Moon, Laptop } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ThemeToggleProps {
  compact?: boolean;
  className?: string;
}

export function ThemeToggle({ compact = false, className = '' }: ThemeToggleProps) {
  const { theme, themePreference, setTheme, toggleTheme, isDark } = useTheme();

  if (compact) {
    return (
      <button
        onClick={toggleTheme}
        className={`p-1.5 text-current hover:opacity-75 transition-all duration-200 focus:outline-none flex items-center justify-center cursor-pointer rounded-full ${className}`}
        title={`Current: ${theme === 'dark' ? 'Dark Mode' : 'Light Mode'} (Click to switch)`}
        aria-label="Toggle light or dark theme"
      >
        {isDark ? (
          <Moon className="w-4 h-4 sm:w-[17px] sm:h-[17px] stroke-[1.5] transition-transform duration-300 rotate-0 hover:-rotate-12" />
        ) : (
          <Sun className="w-4 h-4 sm:w-[17px] sm:h-[17px] stroke-[1.5] transition-transform duration-300 rotate-0 hover:rotate-45" />
        )}
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`p-1 sm:p-1.5 text-current hover:opacity-75 transition-all duration-200 focus:outline-none flex items-center justify-center cursor-pointer rounded-full group ${className}`}
          aria-label="Theme options: Light, Dark, or System Automatic"
          title={`Appearance: ${themePreference === 'system' ? 'System (' + theme + ')' : theme}`}
        >
          {isDark ? (
            <Moon className="w-4 h-4 sm:w-[18px] sm:h-[18px] stroke-[1.5] group-hover:-rotate-12 transition-transform duration-300" />
          ) : (
            <Sun className="w-4 h-4 sm:w-[18px] sm:h-[18px] stroke-[1.5] group-hover:rotate-45 transition-transform duration-300" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-44 bg-white dark:bg-[#18181B] border border-[#E5E5E5] dark:border-[#27272A] shadow-xl p-1 z-50 text-[#111111] dark:text-[#EDEDED]"
      >
        <div className="px-2.5 py-1.5 text-[9px] font-sans uppercase tracking-[0.2em] text-[#767676] dark:text-[#A1A1AA] border-b border-[#F0F0F0] dark:border-[#27272A]">
          APPEARANCE
        </div>
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className={`cursor-pointer px-2.5 py-2 text-xs font-sans tracking-wide flex items-center justify-between rounded-none transition-colors ${
            themePreference === 'light'
              ? 'bg-[#111111] text-white dark:bg-[#EDEDED] dark:text-[#111111] font-medium'
              : 'hover:bg-[#F5F5F5] dark:hover:bg-[#27272A]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sun className="w-3.5 h-3.5" />
            <span>Light</span>
          </div>
          {themePreference === 'light' && <span className="text-[10px] uppercase font-mono">ON</span>}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className={`cursor-pointer px-2.5 py-2 text-xs font-sans tracking-wide flex items-center justify-between rounded-none transition-colors ${
            themePreference === 'dark'
              ? 'bg-[#111111] text-white dark:bg-[#EDEDED] dark:text-[#111111] font-medium'
              : 'hover:bg-[#F5F5F5] dark:hover:bg-[#27272A]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Moon className="w-3.5 h-3.5" />
            <span>Dark</span>
          </div>
          {themePreference === 'dark' && <span className="text-[10px] uppercase font-mono">ON</span>}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className={`cursor-pointer px-2.5 py-2 text-xs font-sans tracking-wide flex items-center justify-between rounded-none transition-colors ${
            themePreference === 'system'
              ? 'bg-[#111111] text-white dark:bg-[#EDEDED] dark:text-[#111111] font-medium'
              : 'hover:bg-[#F5F5F5] dark:hover:bg-[#27272A]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Laptop className="w-3.5 h-3.5" />
            <span>Auto (Device)</span>
          </div>
          {themePreference === 'system' && (
            <span className="text-[9px] uppercase font-mono text-[#A1A1AA] dark:text-[#767676]">
              {theme}
            </span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
