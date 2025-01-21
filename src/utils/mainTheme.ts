import { createTheme } from '@fluentui/react'

const blueColor = '#0068a9'
const whiteColor = '#fff'
const oceanBlueColor = '#003580'

const mainTheme = createTheme({
  defaultFontStyle: {
    fontFamily: 'Open Sans, sans-serif',
    fontWeight: '400'
  },
  palette: {
    themePrimary: blueColor,
    themeDark: oceanBlueColor,
    neutralPrimary: "#000"
  },
  components: {
    PrimaryButton: {
      styles: {
        root: {
          borderRadius: '25px',
          textTransform: 'uppercase',
          backgroundColor: blueColor,
          color: whiteColor,
          border: 'none'
        },
        rootHovered: {
          backgroundColor: oceanBlueColor,
          border: 'none'
        }
      }
    },
    DefaultButton: {
      styles: {
        root: {
          borderRadius: '25px',
          textTransform: 'uppercase',
          borderColor: blueColor,
          backgroundColor: whiteColor,
          color: blueColor,
          transition: '.25s'
        },
        rootHovered: {
          backgroundColor: blueColor,
          color: whiteColor
        },
        rootPressed: {
          backgroundColor: blueColor,
          color: whiteColor
        }
      }
    },
    CommandBarButton: {
      styles: {
        root: {
          color: blueColor
        },
        rootHovered: {
          backgroundColor: 'transparent'
        },
        rootPressed: {
          backgroundColor: 'transparent'
        },
        rootFocused: {
          backgroundColor: 'transparent'
        }
      }
    },
    TextField: {
      styles: {
        root: {
          border: 'none'
        },
        wrapper: {
          border: 'none'
        },
        fieldGroup: {
          borderRadius: '25px'
        }
      }
    },
    Dialog: {
      styles: {
        main: {
          minHeight: '100px',
          borderRadius: '8px',
          background: '#FFFFFF'
        }
      }
    }
  }
})

export default mainTheme
