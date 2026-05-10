// src/store/useStore.js — Global Zustand-like state via React context + useReducer

import { createContext, useContext, useReducer, useEffect } from 'react';

const LS = {
  get: (k, fb) => { try { const v = localStorage.getItem('vc_'+k); return v ? JSON.parse(v) : fb; } catch { return fb; } },
  set: (k, v) => { try { localStorage.setItem('vc_'+k, JSON.stringify(v)); } catch {} }
};

const initial = {
  apiKey: LS.get('apiKey', ''),
  ideas: LS.get('ideas', []),
  events: LS.get('events', []),
  scripts: LS.get('scripts', []),
  posts: LS.get('posts', []),
  social: LS.get('social', {}),
  page: 'dashboard',
  theme: LS.get('theme', 'light'), // Default to light mode
};

function reducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_THEME': {
      const theme = state.theme === 'light' ? 'dark' : 'light';
      LS.set('theme', theme); return { ...state, theme };
    }
    case 'SET_API_KEY': return { ...state, apiKey: action.payload };
    case 'SET_PAGE':    return { ...state, page: action.payload };
    case 'ADD_IDEA': {
      const ideas = [action.payload, ...state.ideas];
      LS.set('ideas', ideas); return { ...state, ideas };
    }
    case 'DELETE_IDEA': {
      const ideas = state.ideas.filter(i => i.id !== action.payload);
      LS.set('ideas', ideas); return { ...state, ideas };
    }
    case 'ADD_EVENT': {
      const events = [...state.events, action.payload];
      LS.set('events', events); return { ...state, events };
    }
    case 'DELETE_EVENT': {
      const events = state.events.filter(e => e.id !== action.payload);
      LS.set('events', events); return { ...state, events };
    }
    case 'ADD_SCRIPT': {
      const scripts = [action.payload, ...state.scripts];
      LS.set('scripts', scripts); return { ...state, scripts };
    }
    case 'UPDATE_SCRIPT': {
      const scripts = state.scripts.map(s => s.id === action.payload.id ? { ...s, ...action.payload } : s);
      LS.set('scripts', scripts); return { ...state, scripts };
    }
    case 'SET_SOCIAL': {
      const social = { ...state.social, ...action.payload };
      LS.set('social', social); return { ...state, social };
    }
    case 'ADD_POSTS': {
      // Merge unique posts by ID and sort by date descending
      const newPosts = [...action.payload, ...state.posts];
      const unique = Array.from(new Map(newPosts.map(p => [p.id, p])).values());
      unique.sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime());
      LS.set('posts', unique); return { ...state, posts: unique };
    }
    default: return state;
  }
}

export function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

import React from 'react';
const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);
  useEffect(() => { LS.set('apiKey', state.apiKey); }, [state.apiKey]);
  return React.createElement(StoreContext.Provider, { value: { state, dispatch } }, children);
}

export function useStore() { return useContext(StoreContext); }
