"use client";
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus } from 'lucide-react';

interface ComboboxProps {
  options: { label: string; value: string }[];
  value: string;
  onChange: (val: string) => void;
  onAdd?: (newVal: string) => void;
  placeholder?: string;
}

export function Combobox({ options, value, onChange, onAdd, placeholder }: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        onChange(query); // commit query on blur if they typed but didn't select
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [query, onChange]);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(query.toLowerCase()) || 
    opt.value.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative w-full">
        <input 
          required
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            onChange(e.target.value); // optimistic
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full h-10 px-3 pr-8 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7368]/20 focus:border-[#1a7368]"
          placeholder={placeholder}
        />
        <ChevronDown className="absolute right-2 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            <ul className="py-1">
              {filteredOptions.map((opt, i) => (
                <li 
                  key={i} 
                  className="px-3 py-2 text-sm hover:bg-slate-100 cursor-pointer text-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between"
                  onClick={() => {
                    onChange(opt.value);
                    setQuery(opt.value);
                    setIsOpen(false);
                  }}
                >
                  <span className="font-medium text-slate-900">{opt.value}</span> 
                  <span className="text-slate-400 text-[10px] sm:text-xs truncate max-w-[200px]">{opt.label}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-3 py-3 text-sm text-slate-500 text-center">No options found.</div>
          )}
          
          {onAdd && query && !options.find(o => o.value.toLowerCase() === query.toLowerCase()) && (
            <div 
              className="border-t border-slate-100 px-3 py-2 text-sm text-[#1a7368] font-medium hover:bg-slate-50 cursor-pointer flex items-center bg-emerald-50/50 transition-colors"
              onClick={() => {
                onAdd(query);
                onChange(query);
                setIsOpen(false);
              }}
            >
              <Plus className="h-4 w-4 mr-1" /> Add "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
