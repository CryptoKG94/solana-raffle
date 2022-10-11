import { Box } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const Header = () => {
  const navigate = useNavigate();
  return (
    <header style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '16px'}}>
      <Box sx={{ padding: "1em" }}>
        <img
          onClick={() => navigate("/")}
          src="/logo.svg"
          alt="logo"
          style={{ width: "12em", cursor: "pointer" }}
        />
      </Box>
      <div className="mr-2 socialMediaIcons flex justify-between text-white w-1/2">
        <div></div>
        <WalletMultiButton></WalletMultiButton>
      </div>
    </header>
  );
};

export default Header;
