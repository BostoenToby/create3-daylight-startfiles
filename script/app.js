const APIKey = 'a0fe8530abd648ad059af576969ca161';

// _ = helper functions
function _parseMillisecondsIntoReadableTime(timestamp) {
  //Get hours from milliseconds
  const date = new Date(timestamp * 1000);
  // Hours part from the timestamp
  const hours = '0' + date.getHours();
  // Minutes part from the timestamp
  const minutes = '0' + date.getMinutes();
  // Seconds part from the timestamp (gebruiken we nu niet)
  // const seconds = '0' + date.getSeconds();

  // Will display time in 10:30(:23) format
  return hours.substr(-2) + ':' + minutes.substr(-2); //  + ':' + s
}

const itBeNight = () => {
  document.querySelector('html').classList.add('is-night');
};

const itBeDay = () => {
  document.querySelector('html').classList.remove('is-night')
}

// 5 TODO: maak updateSun functie
const updateSun = (sun, left, bottom, today) => {
  console.log(left);
  console.log(bottom);
  sun.setAttribute('data-time', `${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}`);
  sun.style.setProperty('--local-sun-position-left', `${left}%`);
  sun.style.setProperty('--local-sun-position-bottom', `${bottom}%`);
  console.log(sun);
};

// 4 Zet de zon op de juiste plaats en zorg ervoor dat dit iedere minuut gebeurt.
const placeSunAndStartMoving = (totalMinutes, sunrise) => {
  // In de functie moeten we eerst wat zaken ophalen en berekenen.
  // Haal het DOM element van onze zon op en van onze aantal minuten resterend deze dag.
  const sunPlaceholder = document.querySelector('.js-sun');
  const minutesLeft = document.querySelector('.js-time-left');

  // Bepaal het aantal minuten dat de zon al op is.
  const date = new Date();
  const sunriseDate = new Date((sunrise) * 1000);
  const minutesUp = date.getHours() * 60 + date.getMinutes() - (sunriseDate.getHours() * 60 + sunriseDate.getMinutes());
  console.log(minutesUp);

  // Nu zetten we de zon op de initiële goede positie ( met de functie updateSun ). Bereken hiervoor hoeveel procent er van de totale zon-tijd al voorbij is.
  const percentage = (100 / totalMinutes) * minutesUp,
    sunLeft = percentage,
    sunBottom = percentage < 50 ? percentage * 2 : (100 - percentage) * 2;

  updateSun(sunPlaceholder, sunLeft, sunBottom, date);

  // We voegen ook de 'is-loaded' class toe aan de body-tag.
  document.querySelector('body').classList.add('is-loaded');

  // Vergeet niet om het resterende aantal minuten in te vullen.
  minutesLeft.innerText = totalMinutes - minutesUp;

  // Nu maken we een functie die de zon elke minuut zal updaten
  const t = setInterval(() => {
    today = new Date();

    if (minutesUp < 0 || minutesUp > totalMinutes) {
      console.log('nacht');
      clearInterval(t);
      //make it night
      itBeNight();
    } else {
      //percentage left berekenen
      //percentage bottom berkenen
      //zon weer wat verder zetten
      //minuten updaten
      percentage = (100 / totalMinutes) * minutesUp;
      sunLeft = percentage;
      sunBottom = percentage < 50 ? percentage * 2 : (100 - percentage) * 2;
      updateSun(sunPlaceholder, left, bottom, today);
      minutesLeft.innerText = totalMinutes - minutesUp;
    }

    //vergeet weer niet om het resterend aantal minuten te updaten en verhoog het aantal verstreken minuten
    //minuten zon vop verhogen
  }, 60000);

  // Bekijk of de zon niet nog onder of reeds onder is
  // Anders kunnen we huidige waarden evalueren en de zon updaten via de updateSun functie.
  // PS.: vergeet weer niet om het resterend aantal minuten te updaten en verhoog het aantal verstreken minuten.
};

// 3 Met de data van de API kunnen we de app opvullen
const showResult = (queryResponse) => {
  // We gaan eerst een paar onderdelen opvullen
  const locationPlaceholder = document.querySelector('.js-location');
  const sunrisePlaceholder = document.querySelector('.js-sunrise');
  const sunsetPlaceholder = document.querySelector('.js-sunset');

  // Zorg dat de juiste locatie weergegeven wordt, volgens wat je uit de API terug krijgt.
  let locatie = queryResponse.city.name;
  let land = queryResponse.city.country;
  locationPlaceholder.innerHTML = `${locatie}, ${land}`;

  // Toon ook de juiste tijd voor de opkomst van de zon en de zonsondergang.
  let opkomst = _parseMillisecondsIntoReadableTime(queryResponse.city.sunrise);
  let ondergang = _parseMillisecondsIntoReadableTime(queryResponse.city.sunset);
  sunrisePlaceholder.innerHTML = `${opkomst}`;
  sunsetPlaceholder.innerHTML = `${ondergang}`;

  // Hier gaan we een functie oproepen die de zon een bepaalde positie kan geven en dit kan updaten.
  const timeDifference = new Date(queryResponse.city.sunset * 1000 - queryResponse.city.sunrise * 1000);

  // Geef deze functie de periode tussen sunrise en sunset mee en het tijdstip van sunrise.
  placeSunAndStartMoving(timeDifference.getHours() * 60 + timeDifference.getMinutes(), queryResponse.city.sunrise);
};

const get = (url) => fetch(url).then((r) => r.json());

// 2 Aan de hand van een longitude en latitude gaan we de yahoo wheater API ophalen.
const getAPI = async (lat, lon) => {
  // Eerst bouwen we onze url op
  let API = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${APIKey}&units=metric&lang=nl&cnt=1`;

  // Met de fetch API proberen we de data op te halen.
  // fetch(API)
  //   .then(function (response) {
  //     if (!response.ok) {
  //       throw Error(`looks like there was a problem. Status Code: ${response.status}`);
  //     } else {
  //       return response.json();
  //     }
  //   })
  //   .then(function (jsonObject) {
  //     showResult(jsonObject);
  //   });
  const weatherResponse = await get(API);

  // Als dat gelukt is, gaan we naar onze showResult functie.
  console.log(weatherResponse);
  showResult(weatherResponse);
};

document.addEventListener('DOMContentLoaded', function () {
  // 1 We will query the API with longitude and latitude.
  getAPI(50.8027841, 3.2097454);
});
