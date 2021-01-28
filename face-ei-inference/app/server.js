// Load the inferencing WebAssembly module
const Module = require('./edge-impulse-standalone');
const fs = require('fs');
// sharp module to retrieve image pixels information
const sharp = require('sharp');
const WebSocket = require('ws');
const { execSync } = require('child_process');
const TelegramBot = require('telegram-bot-api'); 
const axios = require('axios');
const TG_TOKEN = process.env.TG_TOKEN; 
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



//Initialize the classifier
let classifier = new EdgeImpulseClassifier();
const cl = classifier.init();



// Initialize websocket
const wss = new WebSocket.Server({ port: 8080 });

// Incoming websocket connection
wss.on('connection', function connection(ws) {

    ws.on('message', function incoming(message) {
        console.log('received new image');

        // Retrieve raw information from image in argument and parse it for the classifier
        let raw_features = [];
        const buf = sharp(Buffer.from(message, 'base64')).raw().toBuffer()
            .then(img_buffer => {
                let buf_string = img_buffer.toString('hex');

                // store RGB pixel value and convert to integer
                for (let i=0; i<buf_string.length; i+=6) {
                    raw_features.push(parseInt(buf_string.slice(i, i+6), 16));
                }
            })
            .catch(err => {
                console.error('Failed to load image', err);
            });

        // Run classifier once image raw features retrieved and classifier initialized
        let wsdata = {found: false};
        Promise.all([cl, buf])
        .then(async () => {
            let result = classifier.classify(raw_features);
            console.log(result);
            let maxvalue = 0.8;
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

            

            if(maxlabel && maxlabel!='unknown'){
                wsdata.label = maxlabel;
                wsdata.found = true;
                wsdata.filename = new Date().getTime()+'.jpg';

                console.log(`Bird found ${JSON.stringify(wsdata)}`);

                await bot.sendPhoto({
                    chat_id: TG_CHAT_ID,
                    caption: maxlabel,
                    photo: fs.createReadStream('/var/data/frame.jpg')
                })
                

                await axios.post('http://camera/activity', {name:wsdata.filename,label:maxlabel,typ:'image'}, 
                {auth: 
                    {username: process.env.username,
                     password: process.env.password
                    }});
            }
            ws.send(JSON.stringify(wsdata));

        })
        .catch(err => {
            console.error('Failed to run classifier', err);
            ws.send(JSON.stringify(wsdata));
        })

    })

});
