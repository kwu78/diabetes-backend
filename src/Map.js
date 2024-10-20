import React, { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { scaleQuantile } from "d3-scale";
import * as d3 from "d3";
import { Select, MenuItem, InputLabel, FormControl, Switch, Box } from '@mui/material';
import { LegendQuantile, LegendItem, LegendLabel } from "@visx/legend";

import dummyData from './dummyData.json'; // Import the county-level data
import dummyData2 from './dummyData2.json'; // Import the state-level data

const stateGeoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json"; // State borders
const countyGeoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json"; // County borders

const riskFactors = [
  "Obesity",
  "Adult Smoking",
  "Physical Inactivity",
  "Excessive Drinking",
  "Poor Mental Health",
];

const Map = () => {
  const [colourScale, setColourScale] = useState({});
  const [patternScale, setPatternScale] = useState({}); 
  const [hoveredStateFIPS, setHoveredStateFIPS] = useState(null); 
  const [showPatterns, setShowPatterns] = useState(false); // toggle for showing risks factors
  const [selectedRiskFactor, setSelectedRiskFactor] = useState("Obesity"); 
  const legendGlyphSize = 15; // Size for the legend squares
  const [minRiskFactor, setMinRiskFactor] = useState(0); 
  const [maxRiskFactor, setMaxRiskFactor] = useState(100); 

  let colorScale = scaleQuantile()
    .domain([0, 0.15])
    .range([
     "#caf0f8",  // Lightest blue
        "#90e0ef", 
        "#00b4d8", 
        "#0077b6",  
        "#03045e",  // Darkest blue  
    ]);

  useEffect(() => {
    const maxDiabetes = d3.max(dummyData, (d) => d.diabetes_prevalence);

    colorScale = scaleQuantile()
      .domain([0, maxDiabetes])
      .range([
        "#caf0f8",  // Lightest blue
        "#90e0ef", 
        "#00b4d8", 
        "#0077b6",  
        "#03045e",  // Darkest blue  
      ]);

    //  FIPS codes to colors
    const scales = {};
    dummyData.forEach((d) => {
      scales[d.FIPS] = colorScale(d.diabetes_prevalence);
    });
    setColourScale(scales);


    const maxRiskFactorValue = d3.max(dummyData2, (d) => d[selectedRiskFactor]);
    const minRiskFactorValue = d3.min(dummyData2, (d) => d[selectedRiskFactor]);

    setMinRiskFactor(minRiskFactorValue);
    setMaxRiskFactor(maxRiskFactorValue);

    const patternScales = scaleQuantile()
      .domain([minRiskFactorValue, maxRiskFactorValue])
      .range([
        "patternLightest",   
        "patternLighter",    
        "patternLight",     
        "patternMediumLight",
        "patternMedium",     
        "patternBold",      
        "patternBoldest"     
      ]);

    const patterns = {};
    dummyData2.forEach((d) => {
      patterns[d.STATE_FIPS] = patternScales(d[selectedRiskFactor]);
    });
    setPatternScale(patterns);
  }, [selectedRiskFactor]); 
  const handleChange = (event) => {
    setSelectedRiskFactor(event.target.value); // Update the selected risk factor
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <Switch
          checked={showPatterns}
          onChange={() => setShowPatterns(!showPatterns)}
          inputProps={{ 'aria-label': 'controlled' }}
        />
        <span>Show the Selected Risk Factor</span>
      </div>

      <Box sx={{ minWidth: 120, marginBottom: '20px' }}>
        <FormControl fullWidth>
          <InputLabel id="select-risk-factor-label">Risk Factor</InputLabel>
          <Select
            labelId="select-risk-factor-label"
            id="select-risk-factor"
            value={selectedRiskFactor}
            label="Risk Factor"
            onChange={handleChange}
          >
            {riskFactors.map((factor) => (
              <MenuItem key={factor} value={factor}>
                {factor}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <div style={{ display: 'flex', marginBottom: '20px' }}>
  {/* Color Legend */}
  <div style={{ marginRight: '20px' }}>
    <h4>Diabetes %</h4>
    <LegendQuantile scale={colorScale}>
      {(labels) =>
        labels.map((label, i) => (
          <LegendItem key={`legend-${i}`} margin="0 5px">
            <svg
              width={legendGlyphSize}
              height={legendGlyphSize}
              style={{ margin: "2px 0" }}
            >
              <circle
                fill={label.value}
                r={legendGlyphSize / 2}
                cx={legendGlyphSize / 2}
                cy={legendGlyphSize / 2}
              />
            </svg>
            <LegendLabel align="left" margin="0 4px">
              {parseFloat(label.text).toFixed(2)}
            </LegendLabel>
          </LegendItem>
        ))
      }
    </LegendQuantile>
  </div>

  {/* Pattern Legend */}
  {showPatterns && (
    <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column' }}>
      <h4>{selectedRiskFactor} %</h4>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <svg
            width={legendGlyphSize * 2}
            height={legendGlyphSize * 2}
            style={{ marginRight: '10px', border: '1px solid black' }}
          >
            <rect
              width={legendGlyphSize * 2}
              height={legendGlyphSize * 2}
              fill="url(#patternLightest)"
              stroke="black"
              strokeWidth="1"
            />
          </svg>
          <LegendLabel align="left" margin="0 4px">
            {minRiskFactor.toFixed(2)}%
          </LegendLabel>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <svg
            width={legendGlyphSize * 2}
            height={legendGlyphSize * 2}
            style={{ marginRight: '10px', border: '1px solid black' }} 
          >
            <rect
              width={legendGlyphSize * 2}
              height={legendGlyphSize * 2}
              fill="url(#patternBoldest)"
              stroke="black" 
              strokeWidth="1"
            />
          </svg>
          <LegendLabel align="left" margin="0 4px">
            {maxRiskFactor.toFixed(2)}%
          </LegendLabel>
        </div>
      </div>
    </div>
  )}
</div>


      <ComposableMap style={{ width: "70%" }} projection="geoAlbersUsa">
        <ZoomableGroup>
          <defs>
          <pattern id="patternLightest" width="40" height="40" patternUnits="userSpaceOnUse">
  <line x1="0" y1="0" x2="40" y2="40" stroke="#a9a9a9" strokeWidth="1" strokeDasharray="8,25" />
</pattern>


  <pattern id="patternLighter" width="35" height="35" patternUnits="userSpaceOnUse">
    <line x1="0" y1="0" x2="35" y2="35" stroke="#a9a9a9" strokeWidth="1" strokeDasharray="8,25" />
  </pattern>

  <pattern id="patternLight" width="30" height="30" patternUnits="userSpaceOnUse">
    <line x1="0" y1="0" x2="30" y2="30" stroke="#808080" strokeWidth="1.5" strokeDasharray="10,20" />
  </pattern>

  <pattern id="patternMediumLight" width="25" height="25" patternUnits="userSpaceOnUse">
    <line x1="0" y1="0" x2="25" y2="25" stroke="#696969" strokeWidth="2" strokeDasharray="12,15" />
  </pattern>

  <pattern id="patternMedium" width="20" height="20" patternUnits="userSpaceOnUse">
    <line x1="0" y1="0" x2="20" y2="20" stroke="#505050" strokeWidth="2.5" strokeDasharray="15,10" />
  </pattern>

  <pattern id="patternBold" width="15" height="15" patternUnits="userSpaceOnUse">
    <line x1="0" y1="0" x2="15" y2="15" stroke="#303030" strokeWidth="3" strokeDasharray="18,8" />
  </pattern>

  <pattern id="patternBoldest" width="10" height="10" patternUnits="userSpaceOnUse">
    <line x1="0" y1="0" x2="10" y2="10" stroke="#000000" strokeWidth="3.5" strokeDasharray="20,5" />
  </pattern>
</defs>



          <Geographies geography={countyGeoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const countyFips = geo.id; 
                const stateFips = geo.id.substring(0, 2); // extract the first two digits to get the state fip
                const isHoveredState = stateFips === hoveredStateFIPS;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={
                      isHoveredState
                        ? "#0000FF" // when hovered, render blue
                        : colourScale[countyFips] || "#EEE" // this is to fill in the counties
                    }
                    onMouseEnter={() => setHoveredStateFIPS(stateFips)} 
                    onMouseLeave={() => setHoveredStateFIPS(null)} 
                    style={{
                      default: {
                        stroke: "#AAA", // Light grey border for counties
                        outline: "none",
                      },
                      hover: {
                        outline: "none",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>

          <Geographies geography={stateGeoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const stateFips = geo.id;
                const pattern = patternScale[stateFips] || "patternMedium"; 

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={showPatterns ? `url(#${pattern})` : "none"} // Apply the pattern based on toggle
                    style={{
                      default: {
                        stroke: "#333", 
                        strokeWidth: 2, 
                        outline: "none",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
};

export default Map;
