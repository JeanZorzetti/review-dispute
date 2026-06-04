import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
  	extend: {
  		colors: {
  			bg: '#16181d',
  			surface: '#1c1f26',
  			card: '#23262e',
  			accent: '#ff5b35',
  			muted: '#b8bcc4',
  			line: '#2a2e36'
  		},
  		fontFamily: {
  			sans: [
  				'var(--font-geist-sans)',
  				'system-ui',
  				'sans-serif'
  			]
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
  		typography: {
  			invert: {
  				css: {
  					'--tw-prose-body': '#cfd3da',
  					'--tw-prose-headings': '#ffffff',
  					'--tw-prose-links': '#ff5b35',
  					'--tw-prose-bold': '#ffffff',
  					'--tw-prose-bullets': '#ff5b35',
  					'--tw-prose-quote-borders': '#ff5b35',
  					'--tw-prose-hr': '#2a2e36',
  					'--tw-prose-th-borders': '#2a2e36',
  					'--tw-prose-td-borders': '#2a2e36',
  					'--tw-prose-code': '#ffffff',
  					'--tw-prose-pre-bg': '#1c1f26'
  				}
  			}
  		}
  	}
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
}
export default config
