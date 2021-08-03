fetchData();

async function fetchData () {
  // Use fetch to get data from '/api'
  try {
    const response = await fetch('../api');
    const data = await response.json();

    let aqText, aqClass, aqIcon;

    let counter = 0;
    data.forEach(item => {
      counter++;

      // Add ID parameter to API JSON and selet class/text with switch-case
      if (item.aqi < 51) {aqText = 'Good'; aqClass = 'good'; aqIcon = '128525'}
      else if(item.aqi > 50 && item.aqi < 101) {aqText = 'Moderate'; aqClass = 'moderate'; aqIcon = '128522';}
      else if(item.aqi > 100 && item.aqi < 151) {aqText = 'Unhealthy for sensitive groups'; aqClass = 'unhealthy-groups'; aqIcon = '128528';}
      else if(item.aqi > 150 && item.aqi < 201) {aqText = 'Unhealthy'; aqClass = 'unhealthy'; aqIcon = '128534';}
      else if(item.aqi > 200 && item.aqi < 301) {aqText = 'Very Unhealthy'; aqClass = 'unhealthy-very'; aqIcon = '128565';}
      else if(item.aqi > 300) {aqText = 'Hazardous'; aqClass = 'hazardous'; aqIcon = '129327';}

      //console.log(aqText, aqClass);

      // Create container
      const container = document.createElement('div');
      container.classList.add('item');

      container.innerHTML = `
      <div class="counter"><span>${counter}</span></div>
      <div class="delete">
        <span class="delete_action" data-id="${item._id}">
          <svg data-id="${item._id}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline data-id="${item._id}" points="3 6 5 6 21 6"/><path data-id="${item._id}" d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line data-id="${item._id}" x1="10" y1="11" x2="10" y2="17"/><line data-id="${item._id}" x1="14" y1="11" x2="14" y2="17"/></svg>
        </span>
      </div>

      <img src="${item.image64}">
      
      <div class="item-header">
        <span class="mood">${item.mood}</span>
        <span class="date">${new Date(item.timestamp).toLocaleString()}</span>
      </div>

      <div class="item-body">
        <div class="location">
          <span class="desc">Aufnahmeort</span>
          <span class="text">${item.city}</span>
          <span class="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-map-pin"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          </span>
        </div>
        <div class="weather">
          <span class="desc">Wetter</span>
          <span class="text">${item.temp}°C<br>${item.descr}</span>
          <span class="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke-linecap="round" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" class="feather feather-thermometer"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path></svg>
          </span>
        </div>
        <div class="aqi-container">
          <span class="desc">Luftqualität</span>
          <span class="text">${item.aqi}, ${aqText} &#${aqIcon};</span>
          <span class="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-wind"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path></svg>
          </span>
        </div>
      </div>
      `;

      document.querySelector('section.mood-container').append(container);
    });

    // Delete Mood-Item
    document.querySelectorAll('span.delete_action').forEach(element => {
      element.addEventListener('click', async (e) => {
        e.preventDefault();
        console.log(e)
      
        // Get item id
        const id = e.target.dataset.id;
      
        // Server request
        const apiUrl = `/api/delete/${id}`;
      
        try {
          // Gather response from server
          const response = await fetch(apiUrl);
          const json = await response.json();
          console.log(json);
          
          // Input feedback
          if (json.success) {
            const feedbackDiv = document.createElement('div');
            feedbackDiv.innerHTML = `Der Datensatz mit der ID "${id}" wurde erfolgreich gelöscht!`;
            feedbackDiv.classList.add('feedback');
            feedbackDiv.classList.add('success');
            document.querySelectorAll('div.feedback').forEach(e => {e.remove()});;
            document.querySelector('main#tracker-container').prepend(feedbackDiv);
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
            document.querySelector('main#tracker-container').prepend(feedbackDiv);
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
    })
  } 
  catch (error) {
    console.error(error);
  }
  
}

