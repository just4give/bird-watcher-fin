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

## 3D Printer 
This is optional. You may use STL files from my hackster project.
![IMG_3803](https://user-images.githubusercontent.com/9275193/103364208-29f89a80-4a8b-11eb-99f9-a4db6474c0b6.jpg)

## Bird Chirp Classification Using Edge Impulse
![IMG1](https://hackster.imgix.net/uploads/attachments/1236230/0_qgo58objuzppam6q_(1)_8LWY7wN8l1.jpeg?auto=compress%2Cformat&w=740&h=555&fit=max)

At a high level, the microphone records 10 seconds of voice continuously using Sox software and feed into EI inference engine for prediction. I have trained 5 birds commonly sighted in our backyard and "unknown" with random audio clips such as background noise, wind, car, human speaking etc.
![](https://hackster.imgix.net/uploads/attachments/1236231/screen_shot_2020-12-25_at_8_54_21_pm_GSqldygInE.png?auto=compress%2Cformat&w=740&h=555&fit=max)

I have sliced raw data into 5 seconds window with increase of 1 seconds. So basically you get 6 samples from 10 seconds recordings.

![](https://hackster.imgix.net/uploads/attachments/1236234/screen_shot_2020-12-25_at_9_37_35_pm_x0stax4yXG.png?auto=compress%2Cformat&w=740&h=555&fit=max)

![](https://hackster.imgix.net/uploads/attachments/1236235/screen_shot_2020-12-25_at_9_53_25_pm_8gxr1ZEu1N.png?auto=compress%2Cformat&w=740&h=555&fit=max)

I wanted to see the result sooner, so I captured only 3 minutes of data for each bird and 6 minutes of "unknown". I would recommend you to capture as much data as possible, at least 10 minutes for each bird.

![](https://hackster.imgix.net/uploads/attachments/1236236/screen_shot_2020-12-25_at_9_58_32_pm_f3ozmUIsVa.png?auto=compress%2Cformat&w=740&h=555&fit=max)


I got fairly good trained model. Live classification works pretty well. Only concern I found is with "unknown". When someone is speaking or some other background noise is there, model is giving false prediction. If you know how to get a better result, please let me know in the comment with your suggestion 😀

![](https://hackster.imgix.net/uploads/attachments/1236238/screen_shot_2020-12-25_at_10_06_00_pm_BDN5rjhnhu.png?auto=compress%2Cformat&w=740&h=555&fit=max)

Once I am satisfied with the model, I built "Web Assembly" which is downloaded in a zip file with a "wasm" and a javascript file. I used these files later my code.

## Bird Image Classification Using Edge Impulse
I have collected all the images from internet but it would give you more accurate prediction if you can capture some live images from your pi camera. Follow this tutorial on EI website to better understand image classification.


[![](https://balena.io/deploy.png)](https://dashboard.balena-cloud.com/deploy)

Checkout the full project on hackster.io 

https://www.hackster.io/mithun-das/smart-bird-feeder-powered-by-edge-impulse-and-balena-fin-bd6416
