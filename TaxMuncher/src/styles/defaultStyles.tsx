import { StyleSheet } from "react-native";
import colors from "./colors";

const theme = colors.dark;

const defaultStyles = StyleSheet.create({
  // ==========================
  // Layout
  // ==========================

  screen: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  container: {
    flex: 1,
    backgroundColor: theme.background,
  },

  section: {
    marginTop: 28,
  },

  row: {
    flexDirection: "row",
  },

  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  centerHorizontal: {
  alignItems: "center",
},

centerVertical: {
  justifyContent: "center",
},

centerBoth: {
  justifyContent: "center",
  alignItems: "center",
},

  flex: {
    flex: 1,
  },

  // ==========================
  // Typography
  // ==========================

  heroTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: theme.primaryText,
    letterSpacing: 0.5,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.primaryText,
  },

  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.primaryText,
  },

  subheading: {
    fontSize: 17,
    color: theme.secondaryText,
    marginTop: 4,
  },

  body: {
    fontSize: 16,
    color: theme.primaryText,
    lineHeight: 24,
  },

  caption: {
    fontSize: 13,
    color: theme.secondaryText,
  },

  small: {
    fontSize: 12,
    color: theme.secondaryText,
  },

  accentText: {
    color: theme.buttonPrimary,
    fontWeight: "700",
  },

  // ==========================
  // Cards
  // ==========================

  card: {
    backgroundColor: theme.surface,
    borderRadius: 22,
    padding: 18,
    marginVertical: 8,

    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 8,
  },

  glassCard: {
    backgroundColor: theme.card,
    borderRadius: 22,
    padding: 18,

    borderWidth: 1,
    borderColor: theme.border,
  },

  statCard: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 20,
    width: "48%",
    borderWidth: 1,
    borderColor: theme.border,
  },

  // ==========================
  // Buttons
  // ==========================

  primaryButton: {
    backgroundColor: theme.buttonPrimary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",

    shadowColor: theme.buttonPrimary,
    shadowOpacity: 0.4,
    shadowRadius: 10,

    elevation: 6,
  },

  secondaryButton: {
    backgroundColor: theme.surface,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: "center",
  },

  dangerButton: {
    backgroundColor: theme.buttonDanger,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },

  buttonText: {
    color: theme.buttonText,
    fontSize: 16,
    fontWeight: "700",
  },

  // ==========================
  // Inputs
  // ==========================

  input: {
    backgroundColor: theme.surface,
    color: theme.primaryText,

    borderRadius: 18,

    paddingHorizontal: 18,
    paddingVertical: 16,

    fontSize: 16,

    borderWidth: 1.5,
    borderColor: theme.inputBorder,
},

  inputFocused: {
    borderColor: theme.primary,

    borderWidth: 2,

    shadowColor: theme.primary,
    shadowOpacity: 0.35,
    shadowRadius: 8,

    elevation: 6,
},

  textArea: {
    backgroundColor: theme.inputBackground,
    color: theme.primaryText,
    borderRadius: 16,
    padding: 18,
    minHeight: 120,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: theme.border,
  },

  // ==========================
  // Search Bar
  // ==========================

  searchBar: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: theme.inputBackground,

    borderRadius: 18,

    paddingHorizontal: 18,
    paddingVertical: 14,

    borderWidth: 1,
    borderColor: theme.border,
  },

  // ==========================
  // Receipt Card
  // ==========================

  receiptCard: {
    backgroundColor: theme.surface,

    padding: 18,

    borderRadius: 18,

    marginBottom: 16,

    borderWidth: 1,
    borderColor: theme.border,
  },

  receiptMerchant: {
    color: theme.primaryText,
    fontSize: 18,
    fontWeight: "700",
  },

  receiptAmount: {
    color: theme.buttonPrimary,
    fontSize: 24,
    fontWeight: "800",
  },

  receiptDate: {
    color: theme.secondaryText,
    fontSize: 14,
  },

  // ==========================
  // Avatar
  // ==========================

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,

    borderWidth: 3,
    borderColor: theme.buttonPrimary,
  },

  avatarContainer: {
    alignItems: "center",
    marginVertical: 24,
  },

  // ==========================
  // Chips / Tags
  // ==========================

  chip: {
    backgroundColor: theme.secondary,

    paddingHorizontal: 14,
    paddingVertical: 7,

    borderRadius: 100,

    alignSelf: "flex-start",
  },

  chipText: {
    color: theme.primaryText,
    fontWeight: "600",
    fontSize: 13,
  },

  // ==========================
  // Divider
  // ==========================

  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: 20,
  },

  // ==========================
  // Modal
  // ==========================

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,.65)",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    width: "90%",
    backgroundColor: theme.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.border,
  },

  // ==========================
  // Floating Action Button
  // ==========================

  fab: {
    width: 68,
    height: 68,
    borderRadius: 34,

    backgroundColor: theme.buttonPrimary,

    position: "absolute",

    right: 24,
    bottom: 24,

    justifyContent: "center",
    alignItems: "center",

    elevation: 10,
  },

  // ==========================
  // Status
  // ==========================

  success: {
    color: theme.success,
    fontWeight: "700",
  },

  warning: {
    color: theme.warning,
    fontWeight: "700",
  },

  danger: {
    color: theme.danger,
    fontWeight: "700",
  },
  startingContainer: {
    flex: 1,
    backgroundColor: theme.background,

    justifyContent: "center",

    paddingHorizontal: 28,
},

authLogoContainer: {
    alignItems: "center",
    marginBottom: 48,
},

startingTitle: {
    width: 110,
    height: 110,
    resizeMode: "contain",

    marginBottom: 18,
},

// heroTitle: {
//     fontSize: 34,
//     fontWeight: "800",
//     color: theme.primaryText,

//     textAlign: "center",
// },

authSubtitle: {
    color: theme.secondaryText,

    fontSize: 16,

    textAlign: "center",

    marginTop: 10,

    lineHeight: 24,

    marginBottom: 40,
},

passwordText: {
    color: theme.secondaryText,

    fontSize: 13,

    textAlign: "center",

    marginBottom: 24,

    marginTop: -4,
},

buttonSpacing: {
    marginTop: 16,
},

authFooter: {
    marginTop: 42,

    alignItems: "center",
},

footerText: {
    color: theme.secondaryText,

    fontSize: 13,
},
});

export default defaultStyles;