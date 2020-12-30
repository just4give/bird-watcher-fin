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
1. Free [Balena Cloud](https://dashboard.balena-cloud.com/) Account 
2. Free [Edge Impulse Studio](https://studio.edgeimpulse.com/) Account
3. Visual Studio Code ( or your favorite editor ) 
4. [Telegram Bot](https://telegram.org/)

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
I have collected all the images from internet but it would give you more accurate prediction if you can capture some live images from your pi camera. Follow this [tutorial](https://docs.edgeimpulse.com/docs/image-classification) on EI website to better understand image classification.

![](https://hackster.imgix.net/uploads/attachments/1236472/screen_shot_2020-12-26_at_2_15_22_pm_VsIytULlmb.png?auto=compress%2Cformat&w=740&h=555&fit=max)

![](https://hackster.imgix.net/uploads/attachments/1236473/screen_shot_2020-12-26_at_2_23_05_pm_RC5zHxrSd8.png?auto=compress%2Cformat&w=740&h=555&fit=max)

![](https://hackster.imgix.net/uploads/attachments/1236497/screen_shot_2020-12-26_at_3_11_15_pm_IgQL2EjGo2.png?auto=compress%2Cformat&w=740&h=555&fit=max)

![](https://hackster.imgix.net/uploads/attachments/1236498/screen_shot_2020-12-26_at_3_09_32_pm_gAsZUMAzS6.png?auto=compress%2Cformat&w=740&h=555&fit=max)

Once your model is trained, built the web assembly and copy those two files under `face-ei-inference/app` folder.

## Setup Telegram Bot
I used telegram app to send push notification instead of creating my own app to save some development time. You need to setup a telegram bot. The process is very simple. Head over to https://core.telegram.org/bots#3-how-do-i-create-a-bot and create your first bot and copy the access token, save to somewhere. Next start interacting with the bot by typing something, for example, just type "hello". Then open your browser and hit below url.

`https://api.telegram.org/bot<token>/getUpdates`

You will receive a json response. Copy "chat.id" and save it as well. You will need both later.

![](https://hackster.imgix.net/uploads/attachments/1236276/screen_shot_2020-12-25_at_10_47_49_pm_zd6IhbJA1d.png?auto=compress%2Cformat&w=740&h=555&fit=max)

## Creating BalenaCloud project
Click on "Deploy with balena" button below.

[![](https://balena.io/deploy.png)](https://dashboard.balena-cloud.com/deploy)

Please note, this will deploy my trained model. If you like to deploy your model, clone my repo, replace edge-impulse-standalone.js and edge-impulse-standalone.wasm files under "tweet/app" folder.

![](https://hackster.imgix.net/uploads/attachments/1236277/screen_shot_2020-12-25_at_10_53_34_pm_sgQig5r6JM.png?auto=compress%2Cformat&w=740&h=555&fit=max)

Once application is deployed, head over to "Device Services" and add above 4 variables. Use the telegram token and chat id copied earlier. Choose your username and password which you need to provide to access live stream.

![](https://hackster.imgix.net/uploads/attachments/1236283/screen_shot_2020-12-25_at_11_34_31_pm_S7r7mkXZSk.png?auto=compress%2Cformat&w=740&h=555&fit=max)

Next, head over to "Device configuration" and make changes as per above screen shot.

Make sure "audio" is "off" in DT Parameters.

Change DT Overlays to `googlevoicehat-soundcard`.

BALENA_HOST_CONFIG_start_x = 1

BALENA_HOST_CONFIG_gpu_mem_256 = 192

BALENA_HOST_CONFIG_gpu_mem_512 = 256

BALENA_HOST_CONFIG_gpu_mem_1024 = 448

This is very important configuration based on DAC you are using. I have used "Raspiaudio". You may check this link for supported devices. https://sound.balenalabs.io/docs/audio-interfaces/

![](https://hackster.imgix.net/uploads/attachments/1236284/screen_shot_2020-12-25_at_11_46_50_pm_sxOSGAcsGH.png?auto=compress%2Cformat&w=740&h=555&fit=max)

Next, enable public device url and click on the link which will take you to live video stream.

## Demo And Screenshots

![](https://hackster.imgix.net/uploads/attachments/1236515/screen_shot_2020-12-26_at_7_56_42_pm_1TBrQHbvel.png?auto=compress%2Cformat&w=740&h=555&fit=max)

![](https://hackster.imgix.net/uploads/attachments/1236516/screen_shot_2020-12-26_at_7_54_59_pm_nkUZUzfBF9.png?auto=compress%2Cformat&w=740&h=555&fit=max)

## Troubleshooting
If you find microphone or speaker is not working, check your audio card settings ( ssh into "tweet" service)

```
aplay -l
arecord -l
cat /root/.asoundrc
```
![](https://hackster.imgix.net/uploads/attachments/1236290/screen_shot_2020-12-26_at_1_34_30_am_5HDpnll5Cb.png?auto=compress%2Cformat&w=740&h=555&fit=max)



Make sure you see both speaker and microphone card from first two commands and make sure card numbers match with .asoundrc file.

Checkout the full project on hackster.io 

https://www.hackster.io/mithun-das/smart-bird-feeder-powered-by-edge-impulse-and-balena-fin-bd6416
