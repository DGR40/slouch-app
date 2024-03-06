import { Slider } from "@mui/material";
import Card from "./Card.jsx";
import { useState } from "react";
import InfoTooltip from "./InfoTooltip.jsx";

function CustomSlider({ sensitivity, onChange }) {
  const marks = [
    { value: 0, label: "0" },
    { value: 5, label: "5" },
    { value: 10, label: "10" },
  ];
  return (
    <Card>
      <>
        <div className="statcard__header">
          <h3 className="statcard__label">Sensitivity</h3>
          <InfoTooltip
            title="More Info"
            content={"Adjusts Amount of angle deviation the model allows"}
          ></InfoTooltip>
        </div>

        <Slider
          aria-label="Sensitivity"
          defaultValue={5}
          valueLabelDisplay="auto"
          step={1}
          marks={marks}
          min={0}
          max={10}
          onChange={(v) => {
            onChange(v);
          }}
          sx={{
            "& .MuiSlider-thumb": {
              backgroundColor: "#213547", // Change the slider color
              border: "2px solid rgb(253, 79, 79)",
              "&:hover": {
                boxShadow: "0px 0px 0px 8px rgba(0, 123, 255, 0.16)", // Optional: Add hover effect
              },
            },
            "& .MuiSlider-rail": {
              backgroundColor: "#ccc", // Change the track color
              height: "10px",
            },
            "& .MuiSlider-track": {
              backgroundColor: "rgb(253, 79, 79)",
              // Change the selected track color
              height: "10px",
            },
            "& .MuiSlider-root": {
              height: "10px", // Adjust the height as needed
            },
            "& .MuiSlider-markLabel": {
              color: "white",
            },
          }}
        />
      </>
    </Card>
  );
}
export default CustomSlider;
