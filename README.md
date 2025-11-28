# TravelBuddy - Explore Hubli 🌍

A modern travel companion web app for exploring Hubli city, featuring a chatbot, interactive map, and 3D virtual views.

## Features

- **Chatbot Assistant**: Ask questions about Hubli's attractions
- **Interactive Map**: Visualize key locations in Hubli
- **3D Virtual Views**: Explore landmarks in immersive 3D

## Tech Stack

- HTML5, CSS3, JavaScript
- [A-Frame](https://aframe.io/) for 3D experiences
- Google Maps API for interactive maps
- Google Fonts for typography

## Setup Instructions

1. Clone the repository
2. Replace `YOUR_GOOGLE_MAPS_KEY` in `index.html` with your actual Google Maps API key
3. Deploy to Vercel or any static hosting service

## File Structure

```
├── index.html       # Main HTML structure
├── style.css        # Styling and layout
├── script.js        # Interactive functionality
├── data.json        # Hubli location data
├── vercel.json      # Deployment configuration
└── README.md        # Project documentation
```

## Customization

### Adding More Locations

Add new entries to `data.json`:

```json
{
  "name": "Location Name",
  "lat": 15.36,
  "lng": 75.12,
  "desc": "Brief description of the location"
}
```

### Enhancing the 3D View

Modify the A-Frame scene in `index.html`:

```html
<a-scene>
  <!-- Sky background -->
  <a-sky color="#E6E6FA"></a-sky>
  
  <!-- Camera controls -->
  <a-entity camera look-controls wasd-controls position="0 1.6 5"></a-entity>
  
  <!-- 3D objects -->
  <a-box position="0 0.5 -3" color="#2196F3"></a-box>
  <a-text value="Welcome to AGM College, Varur" position="-1.5 2 -3"></a-text>
</a-scene>
```

## Deployment

Deploy easily to Vercel:

1. Connect your GitHub repository
2. Import the project
3. Deploy!

The `vercel.json` configuration handles static file serving.

## Contributing

This project was created for the AGM College Hackathon. Feel free to fork and enhance!

Made with 💙 by Beshu @ AGM College Hackathon// update 7 - Fri Nov 28 13:21:04 IST 2025
// update 15 - Fri Nov 28 13:25:10 IST 2025
// update 20 - Fri Nov 28 13:27:45 IST 2025
// update 22 - Fri Nov 28 13:28:46 IST 2025
