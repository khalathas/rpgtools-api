const app = document.getElementById('root'); //load DOM into app
const logo = document.createElement('img'); //create IMG empty element
logo.src = 'logo.png'; //set img src="logo.png"
const container = document.createElement('div'); //create div
container.setAttribute('class', 'container'); //set div class="container"
app.appendChild(logo); //append logo to the DOM
app.appendChild(container); //append container div to the DOM

// Create a request variable and assign a new XMLHttpRequest object to it.
var request = new XMLHttpRequest()

// Open a new connection, using the GET request on the URL endpoint
request.open('GET', 'http://192.168.1.253:40000/srd/classes', true)

request.onload = function () {
//    var data = this.response;
    var data = JSON.parse(this.response);
    if (request.status >= 200 && request.status < 400){

        data.forEach((Classes) => {

            // Create a div with a card class
        const card = document.createElement('div');
        card.setAttribute('class', 'card');
    
        // Create an h1 and set the text content to the film's title
        const h1 = document.createElement('h1');
        h1.textContent = Classes.Name;

        // Create a p and set the text content to the film's description
        const p = document.createElement('p');
        Classes.Sourcebook = Classes.Sourcebook.substring(0, 300); // Limit to 300 chars
        p.textContent = `${Classes.Sourcebook}...`; // End with an ellipses

        // Append the cards to the container element
        container.appendChild(card);

        // Each card will contain an h1 and a p
        card.appendChild(h1);
        card.appendChild(p);
        })


      // Log each movie's title
//      console.log(Classes.Name);
    } else {
        const errorMessage = document.createElement('div');
        errorMessage.textContent = `Gah, it's not working!`;
        app.appendChild(errorMessage);
    }
}

// Send request
request.send()