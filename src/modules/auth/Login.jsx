import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import { FaUser, FaLock } from "react-icons/fa";
import useLogin from "./useLogin";
import { motion } from "framer-motion";
import theme from "../ThemeSingleton";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { handleLogin, loading, error } = useLogin(username, password);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin();
  };

  const colors = theme.getColors();
  const sizes = theme.getSizes();

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        width: "100vw",
        background: colors.backgroundGradient,
        px: 2,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h2"
            align="center"
            gutterBottom
            sx={{
              fontWeight: "900",
              color: "#ffffff",
              letterSpacing: "1px",
              mb: { xs: 2, sm: 3 },
              textTransform: "uppercase",
              fontFamily: "Roboto, sans-serif",
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
            }}
          >
            Analitics
          </Typography>

          <Box
            sx={{
              width: sizes.boxWidth,
              p: sizes.boxPadding,
              borderRadius: sizes.borderRadius,
              background: colors.boxBackground,
              boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
              transition: "all 0.3s ease-in-out",
            }}
          >
            <Typography
              variant="h5"
              align="center"
              gutterBottom
              sx={{
                fontWeight: "bold",
                color: "#cfd8dc",
                mb: 4,
                fontSize: { xs: "1.2rem", sm: "1.3rem", md: "1.5rem" },
              }}
            >
              Iniciar Sesión
            </Typography>

            <form onSubmit={handleSubmit}>
              <TextField
                label="Usuario"
                variant="outlined"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                fullWidth
                required
                InputProps={{
                  startAdornment: <FaUser style={{ marginRight: 8, color: colors.labelText }} />,
                }}
                sx={{
                  mb: 3,
                  backgroundColor: colors.inputBackground,
                  borderRadius: sizes.inputBorderRadius,
                  "& .MuiInputBase-input": { color: colors.inputText },
                  "& .MuiInputLabel-root": { color: colors.labelText },
                  "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#37474f",
                  },
                  "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                    borderColor: colors.labelText,
                  },
                }}
              />

              <TextField
                label="Contraseña"
                type="password"
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
                InputProps={{
                  startAdornment: <FaLock style={{ marginRight: 8, color: colors.labelText }} />,
                }}
                sx={{
                  mb: 3,
                  backgroundColor: colors.inputBackground,
                  borderRadius: sizes.inputBorderRadius,
                  "& .MuiInputBase-input": { color: colors.inputText },
                  "& .MuiInputLabel-root": { color: colors.labelText },
                  "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#37474f",
                  },
                  "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                    borderColor: colors.labelText,
                  },
                }}
              />

              {error && (
                <Typography color="error" align="center" sx={{ mb: 2 }}>
                  {error}
                </Typography>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  py: 1.5,
                  borderRadius: sizes.buttonBorderRadius,
                  fontWeight: "bold",
                  fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
                  backgroundColor: colors.buttonBackground,
                  color: "#fff",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.4)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: colors.buttonHover,
                    transform: "scale(1.03)",
                  },
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Ingresar"}
              </Button>
            </form>
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
}

export default Login;
