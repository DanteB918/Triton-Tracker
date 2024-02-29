import { useEffect } from "react";
import Chart from 'chart.js/auto'

const metersToFeet = (meters) => {
    return meters * 3.281;
}

export default function Graph(props) {
    useEffect(() => {
        // Helper function to form time ranges
        const range = (start, stop, step) =>
        Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

        // Process first location. Add a for-loop for multiple locations or weather models
        const response = props.response.responses[0];
        // Attributes for timezone and location
        const utcOffsetSeconds = response.utcOffsetSeconds() + (5 * 3600); // Add 5 hours to account for UTC -> EST time diff
        const timezone = response.timezone();
        const timezoneAbbreviation = response.timezoneAbbreviation();
        // const latitude = response.latitude();
        // const longitude = response.longitude();
    
        const hourly = response.hourly();
    
        // Note: The order of weather variables in the URL query and the indices below need to match!
        const weatherData = {
            hourly: {
                time: range(Number(hourly.time()), Number(hourly.timeEnd()), hourly.interval()).map(
                    (t) => new Date((t + utcOffsetSeconds) * 1000)
                ),
                waveHeight: hourly.variables(0).valuesArray(),
            },
        };
    
        var hours = [];
        var height = [];
    
        // `weatherData` now contains a simple structure with arrays for datetime and weather data
        for (let i = 0; i < weatherData.hourly.time.length; i++) {
            hours.push(weatherData.hourly.time[i].toLocaleString());
            height.push(weatherData.hourly.waveHeight[i]);
        }
    
        var chart = new Chart(
            document.getElementById('chart'),
            {
            type: 'bar',
            data: {
                    labels: hours.map(row => row),
                    datasets: [
                        {
                            label: 'Wave Height in feet',
                            data: height.map(row => metersToFeet(row))
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        subtitle: {
                            display: true,
                            text: 'Wave height in your area per hour'
                        }
                    }
                }
            }
        );
    
        Chart.defaults.color = '#fff';
    
        return () => {
            chart.destroy();
          };
      })

      return (
        <div className="graph-container">
            <canvas id="chart" style={{width: "100%"}}></canvas>
        </div>
      )
}
