fetchData();

async function fetchData () {
  // Use fetch to get data from '/api'
  try {
    const response = await fetch('../api');
    const data = await response.json();

    let aqText, aqClass;

    let counter = 0;
    data.forEach(item => {
      counter++;

      // Add ID parameter to API JSON and selet class/text with switch-case
      if (item.aqi < 51) {aqText = 'Good'; aqClass = 'good';}
      else if(item.aqi > 50 && item.aqi < 101) {aqText = 'Moderate'; aqClass = 'moderate';}
      else if(item.aqi > 100 && item.aqi < 151) {aqText = 'Unhealthy for sensitive groups'; aqClass = 'unhealthy-groups';}
      else if(item.aqi > 150 && item.aqi < 201) {aqText = 'Unhealthy'; aqClass = 'unhealthy';}
      else if(item.aqi > 200 && item.aqi < 301) {aqText = 'Very Unhealthy'; aqClass = 'unhealthy-very';}
      else if(item.aqi > 300) {aqText = 'Hazardous'; aqClass = 'hazardous';}

      //console.log(aqText, aqClass);

      // Create container
      const container = document.createElement('div');
      container.classList.add('item');

      container.innerHTML = `
      <span class="counter">${counter}</span>

      <div class="image-container">
        <img src="${item.image64}">
      </div>

      <div class="item-header">
        <span class="date">${new Date(item.timestamp).toLocaleString()}</span>
        <span class="mood">${item.mood}</span>
      </div>
      `;

      document.querySelector('section.mood-container').append(container);
    });
  } 
  catch (error) {
    console.error(error);
  }
  

  
}