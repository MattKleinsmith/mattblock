- [x] Draw a square
- [x] Implement game loop
- [x] Sync player positions between two browser tabs
- [x] Sync player positions over the Internet
- [x] Allow 100 players
- [x] Right click to change color
- [x] Send all game data when player joins
- [x] Add gravity and a ground
- [x] Keep player centered on screen
- [x] Fix key staying down if picking a color while moving
- [x] Right click to change name
- [x] Assign player's old character when they join again
- [x] Focus text box upon right click
- [x] Hide loading
- [x] Load server position, not default position
- [x] Write world data to a file. Load when server starts
- [x] Decollide players from platforms
- [x] Scroll the screen only when near an edge
- [x] Turn players into platforms
- [x] Fix phasing-through-other-players bug
- [x] Fix partial phasing-through-other-players bug
---
### Critical
- [ ] Show tutorial
- [ ] Quest to the upper left
- [ ] Quest to the upper right
### Information
- [ ] 💤 if logged off. Tiny. In bottom right of character. Part of profile object.
- [ ] Right click shows player list, with coordinates
- [ ] Show controls upon right click
- [ ] Help players find each other, e.g. via a compass or minimap.
### Mechanics
- [ ] Make a more precise jump, via holding.
- [ ] Let players push other players
### Bugs
- [ ] Players fall through each other if they have the same x-position. Could solve spawn area problem by having players stack
    - [ ] Consider adding a random tiny value after each movement, to avoid exact x-coordinate
- [ ] Keep spawn area clear for new people. If someone logs out from the spawn area, move them somewhere.
### Zooming
- [ ] Zooming out or in requires a refresh. Can maybe add a callback to the zoom event to recalibrate the world-to-screen conversion
- [ ] Zooming makes highest player text too small
- [ ] Maybe have a min and max zoom. Or just make sure the important icons scale, to avoid limiting players.
- [ ] Maybe create a minimap to show all players. Press "M" to bring up the full map
---
- [ ] Create a command to spawn a second character from the spawn machine, to make testing easier.
---
- [ ] Make world space y point up. Flip to get to screen space.
- [ ] Before closing the server, show a message asking the user to refresh. "Server is down. Refresh page to check if it's up"
---
- [ ] Teamwork example: Double jump off each other.
### Requests
- [ ] "We need you to add height indicator"
---
### Maybe
- [ ] Spawn platforms from the server. Press a button to randomize them. Can sync with refreshing
- [ ] Interpolate remote player character positions
- [ ] Splitscreen
- [ ] Randomly place emojis in the world. Players unlock by touching them. Right click to show unlocked emojis.
- [ ] The more emojis you have, the higher you can jump. Hold space to use full jump. Tap to use standard minimum jump.
- [ ] Can give people some of your emojis. Emojis are currency.
- [ ] Push an object together
    - [ ] Go underneath a big object together and jump to push it up
