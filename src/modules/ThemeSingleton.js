class ThemeSingleton {
  constructor() {
    if (!ThemeSingleton.instance) {
      this.colors = {
        backgroundGradient: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
        boxBackground: "#1e2a38",
        inputBackground: "#263238",
        inputText: "#eceff1",
        labelText: "#90a4ae",
        buttonBackground: "#1565c0",
        buttonHover: "#1e88e5",
      };
      this.sizes = {
        boxWidth: { xs: "90%", sm: "420px", md: "480px" },
        boxPadding: { xs: 4, sm: 5, md: 6 },
        borderRadius: "20px",
        inputBorderRadius: "8px",
        buttonBorderRadius: "10px",
      };
      ThemeSingleton.instance = this;
    }
    return ThemeSingleton.instance;
  }

  getColors() {
    return this.colors;
  }

  getSizes() {
    return this.sizes;
  }
}

const themeInstance = new ThemeSingleton();
Object.freeze(themeInstance);
export default themeInstance;
