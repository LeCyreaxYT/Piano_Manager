import { CustomTitlebar, TitlebarColor } from "custom-electron-titlebar";
window.addEventListener('DOMContentLoaded', () => {
  // Title bar implementation
  new CustomTitlebar({
    containerOverflow: "hidden",
    enableMnemonics: true,
    titleHorizontalAlignment: "center",
    backgroundColor: TitlebarColor.fromHex('#282c34'),
    shadow: true,
    onlyShowMenuBar: false,
    tooltips: {
      minimize: 'Minimize',
      maximize: 'Maximize',
      restoreDown: 'Restore',
      close: 'Close'
    }
  });
    
});