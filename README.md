# Groovy

## Browser

Install NPM dependencies

    npm install
    
Then compile the client side code

    cd ~/Projects/Groovy/app
    cake build
    
Then run the server

    cd ~/Projects/Groovy
    cake server
    
This will open a browser window with the client loaded

## Node-Webkit

For this to work, you need to patch Node-Webkit with ffmpeg. So follow these [Node-Webkit Instructions](https://github.com/rogerwang/node-webkit/wiki/Support-mp3-and-h264-in-video-and-audio-tag).

Then install the dependencies using NPM

    cd groovy
    npm install .

You should now be able to run the app

    ~/Applications/node-webkit.app/Contents/MacOS/node-webkit .
