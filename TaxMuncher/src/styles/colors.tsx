const palette = {
  rust: "#A55226",
  orange: "#D07335",
  amber: "#DB8A45",
  sand: "#ECB36F",
};
const common = {
  primary: palette.rust,
  secondary: palette.orange,
  success: "#46734F",
  warning: "#945A19",
  danger: "#B53732",
  buttonPrimary: palette.rust,
  buttonSecondary: palette.orange,
  buttonDanger: "#B53732",
  buttonText: "#FFFFFF",
  inputFocus: palette.orange,
};
const colors = {
  palette,
  light: {
    ...common,
    background: "#FBF7F1",
    surface: "#FFFFFF",
    card: "#F6EBDD",
    primaryText: "#302116",
    secondaryText: "#7B6859",
    border: "#E9DDD0",
    textboxBackground: "#FFFFFF",
    inputBackground: "#FFFFFF",
  },
  dark: {
    ...common,
    primary: palette.sand,
    background: "#211A16",
    surface: "#30251E",
    card: "#403025",
    primaryText: "#FFF6EB",
    secondaryText: "#CFB79F",
    border: "#554132",
    textboxBackground: "#30251E",
    inputBackground: "#30251E",
    inputFocus: palette.sand,
  },
  accent: palette.amber,
  shadow: "#30211615",
  disabled: "#B9AA9A",
  placeholder: "#8C7867",
  separator: "#E9DDD0",
  highlight: "#F6EBDD",
  inputBorder: "#E9DDD0",
};
export type AppTheme = typeof colors.light;
export default colors;
