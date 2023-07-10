import { Titlebar, TitlebarColor } from "custom-electron-titlebar";
window.addEventListener('DOMContentLoaded', () => {
  // Title bar implementation
  new Titlebar({
    containerOverflow: "hidden",
    enableMnemonics: false,
    titleHorizontalAlignment: "center",
    backgroundColor: TitlebarColor.fromHex('#282c34'),
    shadow: true,
    tooltips: {
      minimize: 'Minimize',
      maximize: 'Maximize',
      restoreDown: 'Restore',
      close: 'Close'
    }
  });
});