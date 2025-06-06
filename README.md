# **Stock Showdown**

### The Players
| school email | utorid | 
| --- | --- |
matthewwyne.wu@mail.utoronto.ca | wumatth8
tara.jorjani@mail.utoronto.ca | jorjanit
crystalc.huang@mail.utoronto.ca | huangcr3

## Brief description of the web application
Our web app is a 1v1 match where players can go against another player in a 1v1 showdown of who can make the most money buying and selling a highly volatile stock in 5 minutes, which we have manually selected for that day. Whoever makes the most money at the end of the 5 minutes will be the winner of that match.

## Modern frontend framework of choice
For our project, we will be using the Vue 3 frontend framework, using TypeScript. We will also be using TailwindCSS for a CSS framework.
### Additional resources:
For our project, we will be using real-time data updates during the 1v1 match.
This will include:
- The countdown timer value
- The fluctuating stock price
- The opponent’s portfolio value specific to the match that can update

We will be using [Alpha Vantage API](https://www.alphavantage.co/documentation/) to retrieve stock prices. The stock price will be preset based on some past time interval, which will then be stored and retrieved from the backend. From the backend, we will retrieve ticks for a given stock and simulate live updates to the stock price. 

For the real-time updates, we will be using [Socket.io](http://Socket.io) to allow persistent WebSocket connections between each user and the server. The server will emit events to each user every few seconds for obtaining the real-time values. When the events are received, the UI will be updated accordingly.

## Alpha version milestone
The alpha version introduces the basic required components such as OAuth 2.0 login and the subscription enforcement. We also want to implement basic matchmaking for users. For our alpha version milestone, we want the following:
- OAuth 2.0 login via Google.
- A Stripe checkout flow for the subscription.
- UI for login and subscription flow.
- Two users can be matched in a 1v1 session. (matchmaking)
## Beta version milestone
The beta version will focus on building the core 1v1 aspect of our web app, and refining elements from the alpha. For our beta version milestone, we want the following:
- A timer and stock price updates based on preset data will function in real time
- Users can buy/sell the stock during the session with a fake amount of currency
- A basic UI will display current cash, value of the stock owned, and total value
## Final version milestone
The final version will refine the UI experience for mid-match and post-match. For our final version milestone, we want the following:
- Real-time opponent updates (i.e. the opponent’s portfolio value for the match) during a match
- Improve the stock price tick visuals to be more dynamic
- Player’s 1v1 match history 
- Display match stats

