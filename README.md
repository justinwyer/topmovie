Top Movie
=========

Requirements:
  * Node JS
 
Getting Started:

    $ npm install
    $ grunt test
    $ grunt develop

open http://localhost:3000 in your browser
  
Deploying to Heroku:
  
    $ heroku login
    $ heroku create --buildpack https://github.com/heroku/heroku-buildpack-nodejs
    $ git push heroku master
    
Dependencies Client Side:
  * AngularJS
  * Wolfy87/EventEmitter
  * lodash
  
Dependencies Server Side:
  * Bluebird
  * einaros/ws
  * mikeal/request
  * cheerio
  * express
  * lodash
  
Dependencies Build:
  * grunt
  * mocha
  * chai
  * karma
  * seedrandom
  * nock
  
Notes
-----
The problem requested that the game depend on a REST API and that it be real time.
REST hooks don't work in a client / server scenario, which leaves polling, I don't feel 
that polling would be a decent solution for anything but a toy app. I therefore chose 
websockets for the communication layer, I chose to use standard websockets over something 
like socket.io as socket.io introduces a lot of incidental debt because of the fallback 
mechanisms, as the problem was present as an HTML 5 I decided standard websockets were a good fit.
 
On the client side I implemented a game client and a spec file which runs integration tests 
against the quiz server. Testing is not as comprehensive as I would have made it given more time 
but the nature of the tests gives a fair level of confidence in the client and server code. The UI is 
a simple AngularJS application, all the testing is manual as there is not much to it, given more 
time I would consider adding some functional tests, the game client can be run out of protractor, 
this would allow the one player to be controlled via the browser and the other via the game client 
directly.

On the server side there is the imdb scraping module which makes use of Bluebird promises and request, 
the module scrapes the top 250 page as well as individual movie pages and their galleries to fetch 
the poster image URL. The quiz module models a quiz, game, and client and makes heavy use of events 
I feel events fit the problem and the websockets decision well. Given more time I would probably 
add a round model which would reduce some of the complexity in the game model.

Lastly IMDB's images CDN monitors the referrer header in requests and randomly returns 403 
responses when the referrer is not an imdb site, I added a revere proxy to the server to serve 
the image requests from their CDN and by pass this restriction.
