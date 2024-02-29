import logo from './images/poseidon.png';
import './App.css';
import loader from './loader.svg';
import Graph from './Graph';
import { fetchWeatherApi } from 'openmeteo';
import { useEffect, useState } from 'react';

function App() {
    const [responses, setResponse] = useState('error');
    const url = "https://marine-api.open-meteo.com/v1/marine";
    const [latitude, setLatitude] = useState(0);
    const [longitude, setLongitude] = useState(0);

    const fetchData = async (url, params) => {
        try {
            setResponse(await fetchWeatherApi(url, params));
        } catch (error) {
            alert('We are having difficulties connecting to our servers. Please try again.')
            console.log(error);
        }
    }

    const date = new Date();

    const dateFormatter = (date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    const formattedDate = dateFormatter(date);

  useEffect(() => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error);
    } else {
        alert('we require geolocation to function');
    }

    function success(position) {
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;

        if (typeof latitude != undefined && latitude != 0) {
            setLatitude(position.coords.latitude);
            setLongitude(position.coords.longitude);
        }

        const params = {
            "latitude": latitude,
            "longitude": longitude,
            'start_date': formattedDate,
            'end_date': formattedDate,
            "timezone": "auto",
            "hourly": "wave_height"
        };

        fetchData(url, params);
    }

    function error() {
        alert("Unable to retrieve your location");
    }
  }, []);

  const formSubmit = (e) => {
    e.preventDefault();

    if (e.target.start_date.value == '' || e.target.end_date.value == '') {
        alert('One of the dates is missing.');

        return;
    }

    const start_date = new Date(e.target.start_date.value);
    const end_date = new Date(e.target.end_date.value);
    const differenceInMilliseconds = Math.abs(end_date - start_date);
    const differenceInDays = Math.ceil(differenceInMilliseconds / (1000 * 60 * 60 * 24));

    if (differenceInDays > 365) {
        alert("Sorry, you can't enter a start/end date that is more than a year apart.");

        return;
    }

    const params = {
        "latitude": latitude,
        "longitude": longitude,
        'start_date': dateFormatter(start_date),
        'end_date': dateFormatter(end_date),
        "timezone": "auto",
        "hourly": "wave_height"
    };

    fetchData(url, params);
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} alt="poseidon logo" className='logo' />
        <h1>Triton Tracker</h1>
        <p>
          The tale of the tides in your area.
        </p>
        <a
          className="App-link"
          href="https://github.com/DanteB918/Triton-Tracker"
          target="_blank"
          rel="noopener noreferrer"
        >
          Star on GitHub!
        </a><br />
        <em>Want to check specific dates? go ahead!</em><br />
        <form onSubmit={formSubmit}>
            <label>
                From:
                <input type="date" name="start_date" defaultValue={date.toLocaleDateString()} placeholder="Start Date" />
            </label>
            <label>
                To:
                <input type="date" name="end_date" defaultValue={date.toLocaleDateString()} placeholder="End Date" />
            </label>
            <input type="submit" />
        </form>
        {typeof responses != undefined && responses != 'error' ? <Graph response={{responses}} /> : <img src={loader} alt="loading image" />}
      </header>
    </div>
  );
}


export default App;
