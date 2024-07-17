import { extendTheme } from 'native-base';

export const THEME = extendTheme({
	colors: {
		blue: '#364D9D',
		blueLight: '#647AC7',
		gray: {
			700: '#F7F7F8',
			600: '#EDECEE',
			500: '#D9D8DA',
			400: '#9F9BA1',
			300: '#5F5B62',
			200: '#3E3A40',
			100: '#1A181B'
		},
		red: {
			500: '#EE7979'
		}
	},
	fonts: {
		heading: 'Karla_700Bold',
		body: 'Karla_400Regular',
	},
	fontSizes: {
		xs: 12,
		sm: 14,
		md: 16,
		lg: 20,
		xl: 24,
	},
	sizes: {
		7: 32,
		14: 45,
		33: 88
	}
})
