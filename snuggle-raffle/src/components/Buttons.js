import { Button } from "@mui/material";
import { styled } from "@mui/material/styles";

export const FilledButton = styled(Button)({
  backgroundColor: "white",
  color: "black",
  textTransform: "capitalize",
  height: "2.5em",
  fontSize: "18px",
  fontWeight: "700",
  fontFamily: "Open Sans",
  width: "100%",
  "&:hover": {
    backgroundColor: "white",
    color: "black",
    textTransform: "capitalize",
  },
});
export const OutlinedButton = styled(Button)({
  border: "2px solid #FFFFFF ",
  color: "white",
  height: "2.5em",
  textTransform: "capitalize",
  fontSize: "18px",
  fontWeight: "700",
  fontFamily: "Open Sans",
  width: "100%",
});
