function setup () {
  /* P5JS */
  // Remove canvas
  noCanvas();
  // Capture video from webcam
  const video = createCapture(VIDEO);
  video.parent('main-container');
  video.size(320, 240);


  // Geo-locate
  // console.log(navigator);
  let lat, lon, city, temp, descr, aqi, aqClass, aqText, aqIcon;
  if ( 'geolocation' in navigator ) {
    navigator.geolocation.getCurrentPosition( async position => {

      try {
        // console.log(position);
        lat = position.coords.latitude;
        lon = position.coords.longitude;

        // Server request
        const apiUrl = `weather/${lat},${lon}`;

        // Gather response from server
        const response = await fetch(apiUrl);
        const json = await response.json();
        console.log(json);

        city = json.weather.name;
        temp = json.weather.main.temp;
        descr = json.weather.weather[0].description;
        aqi = json.airquality.data.aqi;

        if (aqi < 51) {aqText = 'Good'; aqClass = 'good'; aqIcon = '128525'}
        else if(aqi > 50 && aqi < 101) {aqText = 'Moderate'; aqClass = 'moderate'; aqIcon = '128522'}
        else if(aqi > 100 && aqi < 151) {aqText = 'Unhealthy for sensitive groups'; aqClass = 'unhealthy-groups'; aqIcon = '128528'}
        else if(aqi > 150 && aqi < 201) {aqText = 'Unhealthy'; aqClass = 'unhealthy'; aqIcon = '128534'}
        else if(aqi > 200 && aqi < 301) {aqText = 'Very Unhealthy'; aqClass = 'unhealthy-very'; aqIcon = '128565'}
        else if(aqi > 300) {aqText = 'Hazardous'; aqClass = 'hazardous'; aqIcon = '129327'}

        const template = `
        <div class="weather_block">
          <div class="locationDis">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="icon small"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span class="location" title="${lat},${lon}">${city}</span>
          </div>
          <div class="weatherDis">
            <div class="tempContent">
              <span class="temp">${temp.toFixed(0)}??C</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="feather feather-thermometer"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>
            </div>
            <p class="summary">${descr}</p>
          </div>
        </div>
        <div class="aqi_block">
          <div class="aqiTitleDis">
            <span class="aqiTitel">Luftqualit??t</span>
            <a class="info_btn" href="#" onclick="toggleClass(event, this)">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-more-horizontal"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
            </a>
          </div>
          <div class="aqiDis">
            <span class="aqi">${aqi}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-wind"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>
          </div>
        </div>

        <div id="additional_aqi_block" class="hidden">
          <div>
            <p class="aqi-result-text">Ihre Luftqualit??t vor Ort gilt als:</p>
            <span class="aqi-result">${aqText} &#${aqIcon};</span>
          </div>
        </div>`;

        const weatherDiv = document.createElement('div');
        weatherDiv.innerHTML = template;
        weatherDiv.classList.add('info-container');
        document.querySelector('main#main-container').append(weatherDiv);
      }
      catch (error) {
        console.error(error);
      }
      
    })
  } 
  else {
    console.error('Geolocation is not available in this browser')
  }


  // Form - input styles
  document.querySelector('input#mood').addEventListener('focus', () => {document.querySelector('label[for=mood]').classList.add('active')})
  document.querySelector('input#mood').addEventListener('blur', (e) => {
    if (e.target.value.length === 0) document.querySelector('label[for=mood]').classList.remove('active');
  })


  // What happens after user clicks "Send"
  document.querySelector('button#submit-btn').addEventListener('click', async (e) => {
    e.preventDefault();

    // Get user Input
    const mood = document.querySelector('input#mood').value;
    // Get current image
    video.loadPixels();
    const image64 = video.canvas.toDataURL();

    const data = {
      mood,
      city,
      temp,
      descr,
      aqi,
      image64
    }

    try {
      const options = {
        method : 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-type': 'application/json'
        }
      }

      // Send data to api endpoint
      const response = await fetch('/api', options);
      const json = await response.json();

      console.log(json);
      
      // Input feedback
      if (json.success) {
        const feedbackDiv = document.createElement('div');
        feedbackDiv.innerHTML = 'Ihre Eingabe ist gespeichert und unter <a href="tracker/index.html">Tracker</a> zu finden!';
        feedbackDiv.classList.add('feedback');
        feedbackDiv.classList.add('success');
        document.querySelectorAll('div.feedback').forEach(e => {e.remove()});;
        document.querySelector('form').prepend(feedbackDiv);
        let allFeedbacks = document.querySelectorAll('div.feedback');
        for (let e of allFeedbacks) {
          setTimeout(function() {e.remove();}, 5000);
        }
      } else {
        const feedbackDiv = document.createElement('div');
        feedbackDiv.innerHTML = 'Es gab ein Fehler! Bitte erneut versuchen';
        feedbackDiv.classList.add('feedback');
        feedbackDiv.classList.add('hasError');
        document.querySelectorAll('div.feedback').forEach(e => {e.remove()});
        document.querySelector('form').prepend(feedbackDiv);
        let allFeedbacks = document.querySelectorAll('div.feedback');
        for (let e of allFeedbacks) {
          setTimeout(() => { e.remove();}, 5000);
        }
      }


    } 
    catch (error) {
      console.error(error);
    }

  })
}

// Show aqi info modal
function toggleClass (e, el) {
  e.preventDefault();
  // console.log(el.classList)

  el.classList.toggle('opend');

  let element = document.querySelector('div#additional_aqi_block');
  element.classList.toggle('block');
  element.classList.toggle('hidden');
}