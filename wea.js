
const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const weatherCardsDiv = document.querySelector(".weather-cards");
const currentWeatherDiv = document.querySelector(".current-weather");


const API_KEY ="5cb2360828e6cf923d6f35f7d5987a3f";//API key for OpenWeather API

const createWeathercard = (cityName, weatherItem, index) =>{
    if(index === 0){ // HTML for the main weather card
        return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h4>Temperature: ${(weatherItem.main.temp -273.15).toFixed(2)}°C</h4>
                    <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h4>${weatherItem.weather[0].description}</h4>
                </div>
        `
    }else{ //HTML for the other five day forecast card
        return `<li class="card">
        <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
        <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather">
        <h4>Temp: ${(weatherItem.main.temp -273.15).toFixed(2)}°C</h4>
        <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
        <h4>Humidity: ${weatherItem.main.humidity}%</h4>
    </li>`;
    }
   
}

const  getWeatherDetails = (cityName, latitude, longitude) =>{
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(response => response.json()).then(data => {
        
    //    console.log(data);

//filter the forecasts to get only one forecast per day
        const uniqueForecastDays = [];
        const fiveDaysForecast =  data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if(uniqueForecastDays.includes(forecastDate)){
               return uniqueForecastDays.push(forecastDate)
            }
        });

          // Clearing previous weather data
        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";

        //creating weather cards and adding them to the DOM
       // console.log(fiveDaysForecast);
        fiveDaysForecast.forEach((weatherItem, index )=> {
            const html = createWeatherCard(cityName, weatherItem, index);
            if(index === 0){
                currentWeatherDiv.insertAdjacentHTML("beforeend", html);
            }else{
               weatherCardsDiv.insertAdjacentHTML("beforeend", html);
            }
        });

    }).catch(()=>{
        alert("An error  occured while fetching the weather forecast");
    })

}

const getCityCoordinates = () =>{
    const cityName = cityInput.value.trim(); 
    //get user entered city name and remove extra spaces
    if(!cityName === "") return; //return is cityName is empty

    //console.log(cityName);

    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

// get entered city coordinates (latitude, longitude, and name ) from the API response
    fetch(API_URL).then(response => response.json()).then(data =>{
        //console.log(data)
        if(!data.lenght) return alert(`No coordinates found for ${cityName}`);
        const { name, lat, lon } = data[0];
        getWeatherDetails(name , lat , lon)
    }).catch(()=>{
        alert("An error  occured while fetching the coordinates!!");
    });
}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position =>{
           const { latitude, longitude} = position.coords;
           const API_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
           
           //get city name from coordinates using reserve geocoding API
           fetch(API_URL).then(response => response.json()).then(data =>{
           // console.log(data);
           const { name } = data[0];
           getWeatherDetails(name , latitude , longitude)
        }).catch(()=>{
            alert("An error  occured while fetching the CİTY!!");
        });
        },
        error => {
           if(error.code === error.PERMISSION_DENIED){
            alert("Geolocation request denied. Please reset location permission to grant access again");
           }else{
            alert ("Geolocation request error.Please reset location permission");
           }
        });
}


locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click" , getCityCoordinates);
cityInput.addEventListener("keyup" , e => e.key === "Enter" && getCityCoordinates());
