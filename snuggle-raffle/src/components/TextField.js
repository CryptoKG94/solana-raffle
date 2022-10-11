import { TextField } from "@mui/material";
import { alpha, styled } from "@mui/material/styles";

export const CustomTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    border: "2px solid white",
    overflow: "hidden",
    borderRadius: 8,
    color: "white",
    outline: 0,
    transition: theme.transitions.create([
      "border-color",
      "background-color",
      "box-shadow",
    ]),
    "&:hover": { outline: 0 },
    "&.Mui-focused": {
      outline: 0,
      boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 2px`,
      borderColor: theme.palette.primary.main,
    },
  },
}));
