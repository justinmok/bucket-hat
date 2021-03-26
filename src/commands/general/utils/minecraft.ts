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

const client = new net.Socket();
const packetId = encode(0);
const protocolVersion = encode(754);
const state = encode(1);
const followUp = Buffer.from([0x01, 0x00]);

client.setTimeout(10000);

let time = Date.now();
let latency = 0;

export const pingServer = (host: string, port: number = 25565): Promise<MinecraftResponse> => {
    let strLength = (new TextEncoder().encode(host).length),
        serverAddress = Buffer.concat([encode(strLength), Buffer.from(host)]),
        serverPort = Buffer.from([port >> 8, port & 0xFF]),
        packet = [packetId, protocolVersion, serverAddress, serverPort, state],
        length = 0;
    
    for (const chunk of packet) {
        length+= chunk.length;
    }

    let sendPacket = Buffer.concat([encode(length), ...packet]);
    let response: MinecraftResponse;

    return new Promise<MinecraftResponse>((resolve, reject) => {
        client.connect(port, host, () => {
            latency = Date.now() - time;
            client.write(sendPacket);
            client.write(followUp);
        });
        
        client.on('data', (data) => {
            // https://wiki.vg/Server_List_Ping#Response
            response = JSON.parse(data.slice(5).toString('ascii'));
            response.ping = latency;
            client.destroy();
            resolve(response);
        });
        
        client.on('error', (err) => {
            console.log(err);
            reject(err);
        });

        client.on('timeout', () => {
            reject('Timed out');
        });
    });
} 