# infoscreen
<small>v2.1.0</small> Infoscreen for the ChurchTools-API 

### Table of contents
- [Installation](#installation)
- [Usage](#usage)
- [Updating](#updating)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [ToDo](#todo)

## Installation
**TL;DR:**
1. Make sure you have [node.js][nodejs-home] and [git][git-win] installed and in your `PATH`.
1. Clone the repo to anywhere and do `npm install`, for windows there's an automated [install-script][installer-win].
1. Enter your CT-Credentials in `/api/config.js`.
1. Start the server (`node api/app.js`); for windows, there's a `run.bat` in the script folder.

### 0. Preparation
- Install [node.js][nodejs-home] and ensure node and npm are in your `PATH`-variable.
- Install [git][git-win] and ensure git is in your `PATH`-variable.
- Restart your PC

### 1. Installing (windows)
1. Download the [install-script][installer-win] (to do so, click the link, then right click > Save As... > Save it anywhere as `installer.bat`)
1. Place the installer where you want to install the infoscreen, run it and wait for the console window to disappear.
1. Once you installed the infoscreen, you can remove the installer, as it is also included in the installed infoscreen package

### 2. Doing mandatory configuration
In order to fetch your Events from ChurchTools, you need to enter your CT-credentials into the server config file, which is `/api/config.js`.  
Open the file and change the url, email and password field.

```javascript
var config = {
    // mandatory settings
    url: 'https://mychurch.churchtools.de',     // your ChurchTools-URL
    email: 'mail@provider.de',                  // your ChurchTool e-mail
    password: 'superSecretPassword',            // your ChurchTools password
    
    ...
}
```

## Usage
**Note:** You can find all the `.bat` scripts mentioned in the `script` folder.
 
#### 1. Starting the server
To use your infoscreen you first need to start an infoscreen server instance. 
Do this by executing `run.bat` (just double click it). 
If it reads something like `listening on port 80` your server is up and running.  
*Note:* Don't close the terminal window, as it will stop the server.

#### 2. Displaying the infoscreen
Now as the server is up and running, you can connect to it with your browser.
- If your server runs on the same machine as your browser, open [`http://localhost/`][localhost-info] in your browser
- To manage your impressions add `/manage` to the url (e.g.: [`http://localhost/manage`][localhost-manage])

## Updating
If you installed the infoscreen using the install-script you can easily update it by running `update.bat`
(just don't forget to restart the server afterwards).

## Configuration
At the moment there are three files you can / need to change
in order to run / customize your individual infoscreen.
In the future there will be a configuration view, 
where you can easily do all the settings at once.

File | Usage | Action to apply changes
---|---|---
**/api/config.js:** | account and server settings | restart server
**/app/app.config.js:** | client settings | refresh page
**/app/assets/scss/__config-info-scss:** | style settings | run "build.bat" then refresh page

## Troubleshooting
* Use ```https://...``` for your ChurchTools-link, otherwise it won't work
* When you change settings you may have to restart the server (close server terminal window and run ```run.bat``` again)
* Open the Browser-DevTools via F12 and check the console for error descriptions (you will have to reload the page after opening)

## Todo

### overall
* Better error reporting / logging in production use
* Add config-view
* Work on "Configuring your infoscreen"
* Documentation...

### manage
* Feedback onSave
* Fix console errors for unsaved impressions

### info
* Show impression date if there are events from more than one day
* Filter events
    * Sort events by Date and then by time (usually done by CT-API)
    
[installer-win]: https://raw.githubusercontent.com/derzeiss/infoscreen2/master/script/installer.bat
[nodejs-home]: https://nodejs.org
[git-win]: https://git-for-windows.github.io/

[localhost-info]: http://localhost/
[localhost-manage]: http://localhost/manage/