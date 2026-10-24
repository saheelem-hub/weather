const API_KEY = "1804a123c50a3f03f5564591dad9e7d0";
const theme = document.getElementById("themeBtn");
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const weatherCard = document.getElementById("weatherCard");
const errorMsg = document.getElementById("errorMsg");
const favBtn = document.getElementById("add");
const remBtn = document.getElementById("remove");
const favoritesList = document.getElementById("favoritesList");
const forecast = document.getElementById("forecast");//new//
const loading = document.getElementById("loading");//new2//
let favourite=JSON.parse(localStorage.getItem("favourites"))||[];

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function getweather(city){
    const promise=await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
);
if(!promise.ok){    
if(promise.status===401){
    throw new Error("api error");
}
if(promise.status===404){
    throw new Error("city not found");
}
throw new Error("something wrong");
}
const data= await promise.json();
return{
    city: data.name,
        temp: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed
};
}
///////////////////////////////////////////////////////////////////////////////
async function getforecast(city) {//new//
    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    );
    if (!response.ok) {
        throw new Error("Forecast not available");
    }
    const data = await response.json();
   forecast.innerHTML = `
    <h2>5 Day Forecast</h2>
    <div id="forecastDays"></div>
`;
const forecastDays = document.getElementById("forecastDays");
    const days = [];
    data.list.forEach(item => {
        const date = item.dt_txt.split(" ")[0];
        if (!days.includes(date) && days.length < 5) {
            days.push(date);
           forecastDays.innerHTML += `
    <div>
        <h3>${date}</h3>
        <p>Temperature: ${Math.round(item.main.temp)}°C</p>
        <p>Weather: ${item.weather[0].description}</p>
    </div>
`;
        }
    });
}
/////////////////////////////////////////////////////////////////////////////////////
let currentcity="";
async function searchweather(gg=true){
    const city=cityInput.value.trim();
    if(city===""){
        if(gg){
    alert("something problem");
        }
        return;
    }
    loading.style.display="block";//new2//
    errorMsg.style.display="none";//new2//
    try{
        const data=await getweather(city);
        await getforecast(city);//new//
        currentcity=data.city;
        weatherCard.innerHTML=`<h2>${data.city}</h2>
                    <p>Temperature: ${data.temp}°C</p>
                    <p>Feels Like: ${data.feelsLike}°C</p>
                    <p>Weather: ${data.description}</p>
                    <p>Humidity: ${data.humidity}%</p>
                    <p>Wind Speed: ${data.windSpeed} m/s</p>`
        weatherCard.style.display = "block";
        errorMsg.style.display = "none";
    }catch(error){
        errorMsg.textContent=error.message;
        errorMsg.style.display="block";
        weatherCard.style.display="none";
        forecast.innerHTML = "";//new//
    }finally{
        loading.style.display="none";
    }
}
///////////////////////////////////////////////////////////////////////////////////
function debounce(fn, delay) {
    let timer;
    return function () {
        clearTimeout(timer);
        timer = setTimeout(() => {
            if (cityInput.value.trim() === "") {
                weatherCard.style.display = "none";
                errorMsg.style.display = "none";
                currentcity = "";
                forecast.innerHTML = "";//new//
                return;
            }
            fn();
        }, delay);
    };
}

searchBtn.addEventListener("click",()=>searchweather(true));
const debouncedsetting=debounce(()=>searchweather(false),500);
cityInput.addEventListener("input",debouncedsetting);
cityInput.addEventListener("keydown",Event=>{
    if(Event.key==="Enter"){
        searchweather(true);
    }
})
theme.addEventListener("click",()=>{
    if(theme.textContent==="dark"){
        document.body.style.backgroundColor="black";
            document.body.style.color="white";
            theme.textContent="light";
    }else{
            document.body.style.backgroundColor="white";
            document.body.style.color="black";
            theme.textContent="dark";
    }
})
////////////////////////////////////////////////////////////////////////////////////////////////////////////
function addfavourite(){
    if(currentcity===""){
        alert("search city first");
        return;
    }
    if(favourite.includes(currentcity)){
        alert("already");
        return;
    }
    favourite.push(currentcity);
    localStorage.setItem("favourites",JSON.stringify(favourite));
    loadfavorites();
}
function loadfavorites(){
    favoritesList.innerHTML="";
    favourite.forEach(value=>{
    const div=document.createElement("div");
    const city=document.createElement("span");
    city.textContent=value;
    city.addEventListener("click",()=>{
        cityInput.value=value;
        searchweather();
    })
    const removebtn=document.createElement("button");
    removebtn.textContent="remove";
    removebtn.addEventListener("click",()=>{
        removefavourite(value);
    })
    div.appendChild(city);
    div.appendChild(removebtn);
    favoritesList.appendChild(div);
    });
}
function removefavourite(city){
favourite=favourite.filter(value=>value!==city);
localStorage.setItem("favourites",JSON.stringify(favourite));
loadfavorites();
}
favBtn.addEventListener("click",addfavourite);

loadfavorites()
