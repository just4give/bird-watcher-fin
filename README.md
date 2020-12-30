# Smart Bird Watcher

This Balena Fin based Smart Bird Feeder classifies birds by chirps and face using Edge Impulse & sends alerts to your phone and live stream.

![birdwatcher](https://user-images.githubusercontent.com/9275193/103363629-8eb2f580-4a89-11eb-919b-d12f45d013b5.jpg)

The day when I first noticed "Bird Buddy" on kickstarter I decided to make something similar for my daughter all by myself. I was learning Edge Impulse recently and just happened to have few Balena Fin laying on my desk for last few weeks which actually motivated me to start my own "Smart Bird Watcher".

As I had Balena Fin, I had not other choice but use balena OS. But honestly, if I had a choice, I would have chosen balena OS anyway. It's all based on docker containers and you can simply deploy to different devices such as RPI 3 or 4 or zero. You don't need to deal with custom software installations and configurations which are real pain for any raspberry pi based projects.

Wait, you still need some configuration but you do them on balena dashboard and they are very few. I will go over them in a moment.

## Features
First let me tell you the cool features of this bird watcher.

1. Voice classification - Continuously records sound from the microphone and run through Edge Impulse inference engine to predict which bird is chirping. I have trained five most commonly visited birds in our backyard. Chirps were collected from youtube videos and kaggle

2. Image classification - Continuously captures images from camera and run through Edge Impulse inference engine to predict which bird is present. Again I have trained same five birds. Images are taken from internet.

3. Live video streaming - Live stream from the camera can be viewed from anywhere with proper authentication.

4. Push Notification - Instant notification to Telegram app when a bird is sighted.

Now let's take a deeper dive into technology stack

## Hardware Required
1. Balena Fin. You may use Raspberry Pi 3 or 4 as well. Pi Zero works as well but would be very slow.
2. DAC Hat with speaker and microphone. I used [Raspiaudio](https://raspiaudio.com/produit/mic) MIC+ . You can also use USB microphoone but your `.asoundrc` file needs to be modified. 
3. [Pi Cam V2](https://www.amazon.com/Raspberry-Pi-Camera-Module-Megapixel/dp/B01ER2SKFS)

## Software Required
1. Free Balena Cloud Account 
2. Free Edge Impulse Studio Account
3. Visual Studio Code ( or your favorite editor ) 
4. Telegram Bot



[![](https://balena.io/deploy.png)](https://dashboard.balena-cloud.com/deploy)

Checkout the full project on hackster.io 

https://www.hackster.io/mithun-das/smart-bird-feeder-powered-by-edge-impulse-and-balena-fin-bd6416
