# Digital Time Capsule

A browser-based web application that allows users to create digital time capsules - messages, memories, and images that remain locked until a specified future date or time period has passed.

![Digital Time Capsule App](https://via.placeholder.com/800x400?text=Digital+Time+Capsule+App)

## 🌟 Features

- **Create Time Capsules**: Save messages and images to be revealed in the future
- **Flexible Time Locking**: Lock content by specific date or duration (minutes, hours, days)
- **Live Countdown Timer**: Watch as the countdown ticks away to the unlock moment
- **Image Support**: Include up to 3 images in each time capsule
- **Dark Mode**: Toggle between light and dark themes for comfortable viewing
- **Local Storage**: All capsules are saved in your browser's local storage
- **Responsive Design**: Works on desktop and mobile devices

## 📋 How It Works

1. **Create a Capsule**: Write a message, add images, and set when it should unlock
2. **Wait for Unlock**: The capsule remains locked until the specified time arrives
3. **Reveal Content**: When the unlock time comes, your past messages and images are revealed

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled

### Installation

No installation required! This is a client-side application that runs entirely in your browser.

1. Clone the repository or download the files
2. Open `index.html` in your browser
3. Begin creating your time capsules!

## 📝 Usage Guide

### Creating a Time Capsule

1. Click "Create New Capsule" on the home screen
2. Fill in the form:
   - **Title**: Give your capsule a meaningful name
   - **Message**: Write what you want your future self to read
   - **Lock Duration Type**: Choose between specific date or time duration
   - **Upload Images**: Add up to 3 images to your capsule
3. Click "Save Capsule" to create and lock your time capsule

### Viewing Locked Capsules

1. Navigate to "View My Capsules" 
2. Click on any locked capsule to see details
3. The live countdown timer shows exactly how long until the content unlocks
4. You can edit or delete locked capsules before they unlock

### Viewing Unlocked Capsules

Once a capsule's countdown reaches zero:
1. The capsule automatically unlocks
2. All content (message and images) becomes visible
3. You can revisit these memories as often as you like, or delete them

## 🎨 Customization

### Themes

Toggle between light and dark mode using the theme switch in the navigation bar.

### Time Formats

Choose your preferred time locking method:
- **Specific Date**: Select an exact date in the future
- **Minutes**: Lock for a specific number of minutes (great for testing)
- **Hours**: Lock for several hours
- **Days**: Lock for multiple days

## 💾 Data Storage

All time capsules are stored in your browser's local storage. This means:
- Your data stays private on your device
- No registration or account required
- Data persists between browser sessions on the same device
- Clearing browser data will remove your capsules

## ⚠️ Important Notes

- **Browser Support**: Be sure to use a modern browser that supports local storage
- **Storage Limits**: Local storage has limitations (typically 5-10MB per domain)
- **Device Specificity**: Capsules created on one device won't be accessible on another

## 🛠️ Technical Details

- Built with vanilla JavaScript, HTML5, and CSS
- Uses [DaisyUI](https://daisyui.com/) for UI components 
- Fully client-side with no server requirements
- All dates and times use the user's local timezone

## 🔮 Future Features

- Cloud storage option for cross-device access
- Social sharing features
- Email notifications when capsules unlock
- Password protection for sensitive capsules
- Rich text formatting for messages


### Created for preserving digital memories

Remember, the best time to create a time capsule is today—your future self will thank you!