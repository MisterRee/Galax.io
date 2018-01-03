# Galax.io
#### Probably will be renamed in the future since a socket game already exists with that name

A personal project with the lessons learned from previous projects to learn more about JavaScript effciencies, polishing techniques, and the hopes to design a light but interesting interactive experience, in respect to the socket platform.

Currently the project is a mutliplayer socket application, using a 2D canvas to draw out bubbles to depict the player as a spatial object to interact with other objects in the world, and other players. Future plans include drawing out a 3D world - possibly requiring basic game engine design.

#### Lessons Implemented Record:
* MVC Project Setup
  * App.js Acts as the Controller, with Models (Bubbles.js) within the src folder, and the View which gulp.js converts into a compact bundle.min.js file
* Routing with Express.js, circumventing node.js shortcomings with an MVC model and leaving the possibility for future routing upgrades
* Exploring more gulpfile functions during development; a la Synchronous function routes, connecting gulp with npm start, refreshing servers
* Designing loading states with JavaScript and CSS
* Tight Synchronous Functions in relation to client's framerate, and socket handshake optimizations
* Multi-user Chat Design & Implementation
* Cleaner repositiory mangagement with .gitignore

#### Stuff To Learn:
* Lazy-load or Staggered-load with JavaScript/HTML/CSS mix
* Database Design, Implementation with MongoDB
* 3D with Canvas
* SASS?
