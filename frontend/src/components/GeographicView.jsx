// import React from 'react';

// const GeographicView = () => {
//   return (
//     <div className="bg-white rounded-lg shadow-md p-6">
//       <h2 className="text-xl font-bold mb-4">Geographic View</h2>
//       <p className="text-gray-600">
//         This component will show geographic visualization. For the hackathon demo, this is a placeholder.
//       </p>
//     </div>
//   );
// };

// export default GeographicView;

import React, { useEffect, useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';

// Helper: get color based on sentiment score
const getColor = scaleLinear()
  .domain([-1, 0, 1]) // Negative, Neutral, Positive
  .range(['#ef4444', '#fbbf24', '#22c55e']); // Red, Yellow, Green

const geoUrl = '/rwanda-districts.json'; // Place your GeoJSON in public/

const GeographicView = ({ data }) => {
  const [districtScores, setDistrictScores] = useState({});

  useEffect(() => {
    // Aggregate average sentiment score per district
    if (data && data.length > 0) {
      const scores = {};
      data.forEach(row => {
        if (!row.District) return;
        if (!scores[row.District]) scores[row.District] = { total: 0, count: 0 };
        scores[row.District].total += row.Sentiment_Score || 0;
        scores[row.District].count += 1;
      });
      const avgScores = {};
      Object.keys(scores).forEach(d => {
        avgScores[d] = scores[d].count ? scores[d].total / scores[d].count : 0;
      });
      setDistrictScores(avgScores);
    }
  }, [data]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Geographic View</h2>
      <ComposableMap projection="geoMercator" width={500} height={500}>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map(geo => {
              const districtName = geo.properties.NAME_2 || geo.properties.District || geo.properties.name;
              const score = districtScores[districtName] ?? 0;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={getColor(score)}
                  stroke="#222"
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#2563eb", outline: "none" },
                    pressed: { outline: "none" }
                  }}
                >
                </Geography>
              );
            })
          }
        </Geographies>
      </ComposableMap>
      <div className="mt-4 text-gray-600">
        <span className="inline-block w-4 h-4 mr-2" style={{ background: '#22c55e' }}></span>Positive&nbsp;
        <span className="inline-block w-4 h-4 mr-2" style={{ background: '#fbbf24' }}></span>Neutral&nbsp;
        <span className="inline-block w-4 h-4 mr-2" style={{ background: '#ef4444' }}></span>Negative
      </div>
    </div>
  );
};

export default GeographicView;
