import React, { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { scaleQuantile } from "d3-scale";
import * as d3 from "d3";
import { Select, MenuItem, InputLabel, FormControl, Switch, Box } from '@mui/material';
import { LegendQuantile, LegendItem, LegendLabel } from "@visx/legend";
import { Tooltip as ReactTooltip } from "react-tooltip"; // Updated import for Tooltip
import { BarChart, Bar, XAxis,LabelList, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import county_data from './data_processing/outputs/county_json.json'; // Import the county-level data
import stateData from './data_processing/outputs/state_json.json'; // Import the state-level data
import meanData from './data_processing/outputs/mean.json'; // Import national averages

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
  const [selectedState, setSelectedState] = useState(null); // Store selected state for tooltip
  const [showPatterns, setShowPatterns] = useState(false);
  const [selectedRiskFactor, setSelectedRiskFactor] = useState("Obesity");
  const legendGlyphSize = 15;
  const [minRiskFactor, setMinRiskFactor] = useState(0);
  const [maxRiskFactor, setMaxRiskFactor] = useState(100);
  const [hoveredStateData, setHoveredStateData] = useState(null); 
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
    const maxDiabetes = d3.max(county_data, (d) => d.Diabetes);

    colorScale = scaleQuantile()
      .domain([0, maxDiabetes])
      .range([
        "#caf0f8",  // Lightest blue
        "#90e0ef", 
        "#00b4d8", 
        "#0077b6",  
        "#03045e",  // Darkest blue  
      ]);

    const scales = {};
    county_data.forEach((d) => {
      scales[d.FIPS] = colorScale(d.Diabetes);
    });
    setColourScale(scales);

    const maxRiskFactorValue = d3.max(stateData, (d) => d[selectedRiskFactor]);
    const minRiskFactorValue = d3.min(stateData, (d) => d[selectedRiskFactor]);

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
    stateData.forEach((d) => {
      patterns[d.FIPS.toString().substring(0, 2)] = patternScales(d[selectedRiskFactor]);
    });
    setPatternScale(patterns);
  }, [selectedRiskFactor]);

  const handleChange = (event) => {
    setSelectedRiskFactor(event.target.value);
  };
  const prepareBarChartData = (stateData) => {
    if (!stateData) return [];
    const meanValues = meanData;
    return [
      { name: "Obesity", State: stateData.Obesity, Mean: meanValues.Obesity },
      { name: "Adult Smoking", State: stateData["Adult Smoking"], Mean: meanValues["Adult Smoking"] },
      { name: "Physical Inactivity", State: stateData["Physical Inactivity"], Mean: meanValues["Physical Inactivity"] },
      { name: "Excessive Drinking", State: stateData["Excessive Drinking"], Mean: meanValues["Excessive Drinking"] },
      { name: "Poor Mental Health", State: stateData["Poor Mental Health"], Mean: meanValues["Poor Mental Health"] },
      { name: "Diabetes", State: stateData.Diabetes, Mean: meanValues.Diabetes },
    ];
  };
  const handleHover = (stateFips, stateInfo) => {
    setHoveredStateFIPS(stateFips);
    setHoveredStateData(stateInfo); 
  };
  
  const handleMouseLeave = () => {
    setHoveredStateFIPS(null);  
    // setHoveredStateData(null);  
  };
  

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
       

      <div style={{ display: 'flex',marginLeft:"3%", marginBottom: '20px' }}>
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
                  {`${(parseFloat(label.text) * 100).toFixed(1)}%`}
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
   
      <Box sx={{ minWidth: 300, marginLeft:"10%" }}>
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
      <div style={{padding:"2%"}}>
      <Switch
          checked={showPatterns}
          onChange={() => setShowPatterns(!showPatterns)}
          inputProps={{ 'aria-label': 'controlled' }}
        />
        <span>Show the Selected Risk Factor</span>
        </div>

      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>

      <ComposableMap style={{ width: "70%"}} projection="geoAlbersUsa">
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
                const stateFips = geo.id.length === 5 ? geo.id.substring(0, 2) : geo.id.substring(0, 1);
                const isHoveredState = stateFips === hoveredStateFIPS;
                const stateInfo = stateData.find(d => d.FIPS === stateFips);
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={
                      isHoveredState
                        ? "#0000FF" 
                        : colourScale[countyFips] || "#EEE"
                    }
                    onMouseEnter={() => handleHover(stateFips, stateInfo)}
                    onMouseLeave={() => handleMouseLeave}
                    data-tooltip-id="map-tooltip"
                    data-tooltip-content={`FIPS: ${stateFips}`}
                    style={{
                      default: {
                        stroke: "#AAA", 
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
                    fill={showPatterns ? `url(#${pattern})` : "none"}
                    
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
     
      {hoveredStateData && (
  <div style={{ width: "30%", padding: "20px" }}>
    <h4>{hoveredStateData.STATE_NAME} vs National Mean</h4>
    <BarChart
      width={500}
      height={600}  
      data={prepareBarChartData(hoveredStateData)}
      margin={{ top: 40, right: 30, left: 20, bottom: 80 }}  
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis 
        dataKey="name" 
        angle={-90}  
        textAnchor="end"  
        interval={0}  
        height={80}  
      />
     <YAxis
        tickFormatter={(tick) => `${tick}%`}  
      />
      <RechartsTooltip />
      <Legend 
        layout="horizontal" 
        verticalAlign="top"  // Position the legend at the top
        align="center"  // Center the legend horizontally
      />
      <Bar dataKey="State" fill="#82ca9d">
        <LabelList dataKey="State" position="top" formatter={(value) => `${value}%`} />  {/* Add percentage labels */}
      </Bar>
      <Bar dataKey="Mean" fill="#8884d8">
        <LabelList dataKey="Mean" position="top" formatter={(value) => `${value}%`} />  {/* Add percentage labels */}
      </Bar>
    </BarChart>
  </div>
)}

</div>
      <ReactTooltip id="map-tooltip" />
    </div>
  );
};

export default Map;
