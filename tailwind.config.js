/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Blue is reserved for actionable elements (PRD §9, and LinkedIn's own rule).
        accent: {
          DEFAULT: '#0A66C2',
          hover: '#004182',
          disabled: '#7FA9D4',
        },
        // LinkedIn's text scale, measured from the iOS app (see Figma Colour page).
        // #666 is 5.7:1 on white and 4.5:1 on the app canvas, so AA holds.
        ink: {
          DEFAULT: '#191919', // rgba(0,0,0,.9) on white: primary text
          muted: '#666666', // rgba(0,0,0,.6): secondary text, timestamps
          faint: '#666666', // LinkedIn uses the same .6 grey for meta text
          action: '#404040', // rgba(0,0,0,.75): post action icons and labels
        },
        surface: {
          DEFAULT: '#ffffff',
          page: '#f4f2ee', // LinkedIn web canvas
          app: '#e9e5df', // LinkedIn iOS canvas (gaps between feed posts)
          hover: '#f3f6f8',
        },
        // LinkedIn's positive green, matched by eye from the iOS Job tracker on
        // Mobbin: the "Applied" tag, the selected stage radio, the selected filter
        // chip. LinkedIn's rule, which we follow: blue = you can act on it,
        // green = progress or good news, grey = neutral. Never red for a person's no.
        positive: {
          DEFAULT: '#01754F', // selected controls
          tint: '#E1EFDF', // tag background
          ink: '#1B5E3B', // tag text
        },
        // LinkedIn's success badge (the sage ring on "You're all set", "Post successful")
        success: {
          ring: '#A8BF96',
          disc: '#DCE7D1',
          ink: '#38434F',
        },
        line: 'rgba(0,0,0,0.08)',
        danger: '#CB112D', // LinkedIn notification badge / error red
        reaction: {
          like: '#378FE9',
          love: '#DF704D',
        },
        // "Start a post" action tints on LinkedIn web
        feed: {
          video: '#5F9B41',
          photo: '#378FE9',
          article: '#E06847',
        },
      },
      borderRadius: {
        card: '8px',
      },
      boxShadow: {
        card: '0 0 0 1px rgba(0,0,0,0.08), 0 2px 3px rgba(0,0,0,0.06)',
        cardHover: '0 0 0 1px rgba(0,0,0,0.10), 0 6px 16px rgba(0,0,0,0.10)',
        pop: '0 8px 28px rgba(0,0,0,0.18)',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        popIn: {
          from: { opacity: '0', transform: 'translateY(6px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        // Guided-test spotlight: ring appears, then breathes outward.
        spotIn: {
          from: { opacity: '0', transform: 'scale(1.15)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        spotPulse: {
          '0%': { boxShadow: '0 0 0 0 rgba(10,102,194,0.45)' },
          '100%': { boxShadow: '0 0 0 12px rgba(10,102,194,0)' },
        },
        nudge: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(3px)' },
        },
        nudgeX: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(-3px)' },
        },
        stepDone: {
          '0%': { opacity: '0', transform: 'scale(0.6)' },
          '60%': { opacity: '1', transform: 'scale(1.15)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        // Status change: the status you last saw leaves, the new one arrives.
        statusOut: {
          from: { opacity: '1', transform: 'translateY(0)' },
          to: { opacity: '0', transform: 'translateY(-10px)' },
        },
        statusIn: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        iconOut: {
          from: { opacity: '1', transform: 'scale(1)' },
          to: { opacity: '0', transform: 'scale(0.5)' },
        },
        iconIn: {
          '0%': { opacity: '0', transform: 'scale(0.5)' },
          '60%': { opacity: '1', transform: 'scale(1.08)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        // One soft ring when a request reaches Referred, in the success badge's sage.
        ringOnce: {
          '0%': { boxShadow: '0 0 0 0 rgba(168,191,150,0.6)' },
          '100%': { boxShadow: '0 0 0 14px rgba(168,191,150,0)' },
        },
        // History: a new entry drops in, and its connector grows down to the last.
        entryIn: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        grow: {
          from: { transform: 'scaleY(0)' },
          to: { transform: 'scaleY(1)' },
        },
        // The entry makes room for itself, so the older history is pushed down
        // rather than a blank gap waiting to be filled.
        entryExpand: {
          from: { gridTemplateRows: '0fr' },
          to: { gridTemplateRows: '1fr' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out both',
        'slide-up': 'slideUp 0.34s cubic-bezier(0.2,0.7,0.3,1) both',
        'pop-in': 'popIn 0.3s cubic-bezier(0.2,0.8,0.3,1) both',
        'spot-pulse':
          'spotIn 0.35s cubic-bezier(0.2,0.8,0.3,1) both, spotPulse 1.6s ease-out 0.35s infinite',
        nudge: 'nudge 1.2s ease-in-out infinite',
        'nudge-x': 'nudgeX 1.2s ease-in-out infinite',
        'step-done': 'stepDone 0.45s cubic-bezier(0.2,0.8,0.3,1) both',
        'status-out': 'statusOut 0.26s cubic-bezier(0.4,0,1,1) both',
        'status-in': 'statusIn 0.4s cubic-bezier(0.2,0.8,0.3,1) both',
        'icon-out': 'iconOut 0.22s cubic-bezier(0.4,0,1,1) both',
        'icon-in': 'iconIn 0.45s cubic-bezier(0.2,0.8,0.3,1) both',
        'ring-once': 'ringOnce 0.9s ease-out both',
        'entry-in': 'entryIn 0.36s cubic-bezier(0.2,0.8,0.3,1) both',
        grow: 'grow 0.42s cubic-bezier(0.4,0,0.2,1) both',
        'entry-expand': 'entryExpand 0.4s cubic-bezier(0.4,0,0.2,1) both',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}
