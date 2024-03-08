import React from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import InfoIcon from "@mui/icons-material/Info";

function InfoTooltip({ title, content }) {
  return (
    <Tooltip
      title={content}
      arrow
      style={{ marginTop: 0 }}
      placement={"right"}
      sx={{
        fontSize: "20px",
        color: "black", // Set the font size to 20 pixels
      }}
    >
      <IconButton style={{ color: "#213547" }}>
        <InfoIcon
          sx={{
            fontSize: "20px", // Set the font size to 20 pixels
          }}
        />
      </IconButton>
    </Tooltip>
  );
}

export default InfoTooltip;
