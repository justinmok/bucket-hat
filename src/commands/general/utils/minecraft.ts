import * as net from 'net';
import { MinecraftResponse } from '../../../../typings';


// https://github.com/chrisdickinson/varint/blob/323cb66c382744fecd6af378bff145bc59b8af66/encode.js
const MSB = 0x80
  , REST = 0x7F
  , MSBALL = ~REST
  , INT = Math.pow(2, 31)

const encode = (num): Buffer => {
      let out: number[] = [];
      let offset = 0;
    
      while(num >= INT) {
        out[offset++] = (num & 0xFF) | MSB
        num /= 128
      }
      while(num & MSBALL) {
        out[offset++] = (num & 0xFF) | MSB
        num >>>= 7
      }
      out[offset] = num | 0
            
      return Buffer.from(out);
}

const packetId = encode(0);
const protocolVersion = encode(754);
const state = encode(1);
const followUp = Buffer.from([0x01, 0x00]);

const createPacket = (host: string, port: number): Buffer => {
    let strLength = (new TextEncoder().encode(host).length),
        serverAddress = Buffer.concat([encode(strLength), Buffer.from(host)]),
        serverPort = Buffer.from([port >> 8, port & 0xFF]),
        packet = [packetId, protocolVersion, serverAddress, serverPort, state],
        length = 0;
    for (const chunk of packet) {
        length+= chunk.length;
    }
    return Buffer.concat([encode(length), ...packet]);
}

export const pingServer = (host: string, port: number = 25565): Promise<MinecraftResponse> => {
    return new Promise<MinecraftResponse>((resolve, reject) => {
        const client = new net.Socket()
        client.setTimeout(10000);

        let time = Date.now();
        let welcomePacket = createPacket(host, port);
        let raw = Buffer.from([]);
        let response: MinecraftResponse;
        let latency = 0;

        client.connect(port, host, () => {
            latency = Date.now() - time;
            client.write(welcomePacket);
            client.write(followUp);
        });
        
        console.log(`Pinging ${host} on port ${port}`);

        client.on('data', (data) => {
            raw = Buffer.concat([raw, data]);
            // Looks for `}}` termination
            console.log(raw.lastIndexOf('7d', raw.length, 'hex'));
            console.log(raw.length - 1);

            if (raw.lastIndexOf('7d', 111111111111111, 'hex') == raw.length - 1) {
                // parse json from `{"d`
                console.log(`start index: ${raw.indexOf('7b22', 0, 'hex')}`);
                let rawResponse = JSON.parse(raw.slice(raw.indexOf('7b22', 0, 'hex')).toString('ascii'));
                response = { ...rawResponse, favicon: rawResponse.favicon?.slice('22').replace('\n', '')};
                client.destroy();
                response.ping = latency;
                //console.log(response);
                resolve(response);
            }
        });
        
        client.on('error', (err) => {
            //console.log(err);
            client.destroy();
            reject(err);
        });

        client.on('timeout', () => {
            client.destroy();
            reject('Timed out');
        });
    });
} 