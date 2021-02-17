// Load the inferencing WebAssembly module
const Module = require('./edge-impulse-standalone');
const WaveFile = require('wavefile').WaveFile;
const fs = require('fs');
// sharp module to retrieve image pixels information
const sharp = require('sharp');
const WebSocket = require('ws');
const { execSync } = require('child_process');
const TelegramBot = require('telegram-bot-api'); 
const axios = require('axios');

//read more about sox command and silence 
//http://sox.sourceforge.net/sox.html
//https://digitalcardboard.com/blog/2009/08/25/the-sox-of-silence/comment-page-2/
//const SOX_COMMAND ='sox -t alsa default -b 16 -r 16k ./request.wav silence 1 0.2 10% 1 0.5 10%  trim 0 2';
const SILENCE = process.env.SILENCE || 'silence 1 0.2 1% 1 0.3 1%  trim 0 5'
const SOX_COMMAND = `sox -t alsa default -b 16 -r 16k /var/data/request.wav ${SILENCE}`;

const TG_TOKEN =  process.env.TG_TOKEN; 
const TG_CHAT_ID = process.env.TG_CHAT_ID;
const bot = new TelegramBot({token: TG_TOKEN}); 
let lastAudioSent = new Date().getTime();

// Classifier module
let classifierInitialized = false;
Module.onRuntimeInitialized = function () {
    classifierInitialized = true;
};

class EdgeImpulseClassifier {


    constructor() {
        this._initialized = false;
    }

    init() {
        if (classifierInitialized === true) return Promise.resolve();

        return new Promise((resolve) => {
            Module.onRuntimeInitialized = () => {
                resolve();
                classifierInitialized = true;
            };
        });
    }

    classify(rawData, debug = false) {
        if (!classifierInitialized) throw new Error('Module is not initialized');

        const obj = this._arrayToHeap(rawData);
        let ret = Module.run_classifier(obj.buffer.byteOffset, rawData.length, debug);
        Module._free(obj.ptr);

        if (ret.result !== 0) {
            throw new Error('Classification failed (err code: ' + ret.result + ')');
        }

        let jsResult = {
            anomaly: ret.anomaly,
            results: []
        };

        for (let cx = 0; cx < ret.classification.size(); cx++) {
            let c = ret.classification.get(cx);
            jsResult.results.push({ label: c.label, value: c.value });
        }

        return jsResult;
    }

    _arrayToHeap(data) {
        let typedArray = new Float32Array(data);
        let numBytes = typedArray.length * typedArray.BYTES_PER_ELEMENT;
        let ptr = Module._malloc(numBytes);
        let heapBytes = new Uint8Array(Module.HEAPU8.buffer, ptr, numBytes);
        heapBytes.set(new Uint8Array(typedArray.buffer));
        return { ptr: ptr, buffer: heapBytes };
    }
}

class Recorder {

    constructor() {
        this.classifier = new EdgeImpulseClassifier();
    }

    async init(){
        await this.classifier.init();
        execSync("sox -t alsa default -b 16 -r 16k /var/data/noise.wav  trim 0 5").toString();
        execSync("sox /var/data/noise.wav -n noiseprof /var/data/noise.prof").toString();
        console.log("Noise profile created");
    }

    async run() {
        console.log(SOX_COMMAND);
        execSync(SOX_COMMAND, {}).toString();
        console.log('audio recorded', new Date());
        // execSync("sox /var/data/request.wav /var/data/clean.wav noisered /var/data/noise.prof 0.21");
        // console.log("audio cured ...");
        let buffer = fs.readFileSync('/var/data/request.wav');

        if (buffer.slice(0, 4).toString('ascii') !== 'RIFF') {
            throw new Error('Not a WAV file, first four bytes are not RIFF but ' +
                buffer.slice(0, 4).toString('ascii'));
        }
        let wav = new WaveFile(buffer);
        wav.toBitDepth('16');

        let fmt = wav.fmt;

        let freq = fmt.sampleRate;
        console.log('Frequency', freq);
        console.log('Channel', fmt.numChannels);
        console.log('Length', wav.data.samples.length);
        console.log('Bits per sample', fmt.bitsPerSample);

        // tslint:disable-next-line: no-unsafe-any
        let totalSamples =  wav.data.samples.length / (fmt.bitsPerSample / 8);
        //let totalSamples = 32000;

        console.log('Total samples', totalSamples);
        let dataBuffers = [];

        for (let sx = 0; sx < totalSamples; sx += fmt.numChannels) {
            try {
                let sum = 0;

                for (let channelIx = 0; channelIx < fmt.numChannels; channelIx++) {
                    sum += wav.getSample(sx + channelIx);
                }

                dataBuffers.push(sum / fmt.numChannels);
            }
            catch (ex) {
                console.error('failed to call getSample() on WAV file', sx, ex);
                throw ex;
            }
        }

        console.log(dataBuffers.length);
        
        try {

            let result = this.classifier.classify(dataBuffers)
            console.log(result);

            let maxvalue = 0.9;
            if(process.env.CONFIDENCE){
                maxvalue = parseFloat(process.env.CONFIDENCE);
            }
            console.log(`Confidence threshold ${maxvalue}`);
            
            let maxlabel;
            result.results.forEach(item=>{
                if(item.value>=maxvalue){
                    maxvalue = item.value;
                    maxlabel = item.label
                }
            })
            //console.log(`Max label ${maxlabel} with confidence ${maxvalue}`);
            if(maxlabel!==undefined && maxlabel !=='unknown'){
                let confidence = Math.round(maxvalue*100);
                console.log('------------------------------------------------------');
                console.log(`Bird Sound detected ${maxlabel} with confidence ${confidence}  at ` , new Date());
                console.log('------------------------------------------------------');
                let id = new Date().getTime();
                let filename = maxlabel+"."+id+'.wav';
                execSync(`cp /var/data/request.wav /var/media/${filename}`);
                // await bot.sendAudio({
                //     chat_id: TG_CHAT_ID,
                //     caption: `${maxlabel} with ${confidence}% confidence`,
                //     audio: fs.createReadStream(`/var/media/${filename}`)
                // })

                await axios.post('http://camera/activity', {name:filename,label:maxlabel,typ:'audio'}, 
                {auth: 
                    {username: process.env.username,
                     password: process.env.password
                    }});

            }
            

  
            
        } catch (error) {
            console.log(error);
        }

        //execSync('aplay request.wav');
        setTimeout(() => {
            this.run();
        }, 1000);
    }



}

(async function () {
    let recorder = new Recorder();
    await recorder.init();
    await recorder.run();
})();





