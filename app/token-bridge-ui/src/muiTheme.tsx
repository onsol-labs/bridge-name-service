import { createTheme, responsiveFontSizes, adaptV4Theme } from "@mui/material/styles";

//import InterSemiBold from './fonts/Inter/static/Inter-SemiBold';

export const theme = responsiveFontSizes(
  createTheme({
    palette: {
      mode: "dark",
    },
    typography: {
      fontSize: 13,
      h1: {
        lineHeight: 0.9,
        letterSpacing: -2,
        fontWeight: "bold",
        fontSize: "3rem",
      },
      h2: {
        fontWeight: "200",
      },
      h4: {
        fontWeight: "600",
        letterSpacing: -1.02,
      },
    },
    components: {
      MuiCssBaseline: {
        "styleOverrides": {
          body: {
            overscrollBehaviorY: "none",
            backgroundPosition: "top center",
            backgroundRepeat: "repeat-y",
            backgroundSize: "120%",
          },
          "*": {
            scrollbarWidth: "thin",
          },
          "*::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "*::-webkit-scrollbar-thumb": {},
          "*::-webkit-scrollbar-corner": {
            // this hides an annoying white box which appears when both scrollbars are present
            backgroundColor: "transparent",
          },
        },
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            "&:before": {
              display: "none",
            },
          },
        }
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            border: "1px solid",
          },
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {},
          outlinedSizeSmall: {
            padding: "6px 9px",
            fontSize: "0.70rem",
          },
        }
      },
      MuiLink: {
        styleOverrides: {
          root: {},
        }
      },
      MuiPaper: {},
      MuiStepper: {
        styleOverrides: {
          root: {
            backgroundColor: "transparent",
            padding: 0,
          },
        }
      },
      MuiStep: {
        styleOverrides: {
          vertical: {
            backgroundColor: "rgba(255,255,255,.07)",
            backdropFilter: "blur(4px)",
            padding: "32px",
          },
        }
      },
      MuiStepConnector: {
        styleOverrides: {
          lineVertical: {
            borderLeftWidth: 0,
          },
        }
      },
      MuiStepContent: {
        styleOverrides: {
          root: {
            borderLeftWidth: 0,
            marginLeft: 0,
            paddingLeft: 0,
          },
        }
      },
      MuiStepLabel: {
        styleOverrides: {
          label: {
            textTransform: "uppercase",
            "&.MuiStepLabel-alternativeLabel": { textTransform: "none" },
            "&.MuiStepLabel-active": {},
            "&.MuiStepLabel-completed": {},
          },
        }
      },
      MuiTabs: {
        styleOverrides: {
          root: {},
          indicator: {
            height: "100%",
            zIndex: -1,
          },
        }
      },
      MuiTab: {
        styleOverrides: {
          root: {
            fontWeight: "bold",
            fontSize: 18,
            padding: 12,
            letterSpacing: "-0.69px",
            textTransform: "none",
          },
          textColorInherit: {
            opacity: 1,
          },
        }
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: "none",
          },
        }
      },
    },
  })
);
