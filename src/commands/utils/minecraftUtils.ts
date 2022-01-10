import net = require('net');
import { MinecraftResponse } from '../../../typings';

enum Minecraft {
    PROTOCOL_VERSION = 754,
    SERVER_PORT = 25565,
}

/** https://github.com/chrisdickinson/varint/blob/323cb66c382744fecd6af378bff145bc59b8af66/encode.js */
const MSB = 0x80
  , REST = 0x7F
  , MSBALL = ~REST
  , INT = Math.pow(2, 31)

const encode = (num: number): Buffer => {
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
const protocolVersion = encode(Minecraft.PROTOCOL_VERSION);
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

/**
 * Pings a Minecraft server and tries to return information about it
 * @param host Valid minecraft server host to ping
 * @param port Port the server is listening on. Defaults to `25565`
 * @returns Information about the minecraft server
 */
export const pingServer = (host: string, port: number = Minecraft.SERVER_PORT): Promise<MinecraftResponse> => {
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
        
        client.on('data', (data) => {
            raw = Buffer.concat([raw, data]);
            /** Looks for `}}` termination */

            if (raw.lastIndexOf('7d', 111111111111111, 'hex') == raw.length - 1) {
                console.log(`start index: ${raw.indexOf('7b22', 0, 'hex')}`);
                let rawResponse = JSON.parse(raw.slice(raw.indexOf('7b22', 0, 'hex')).toString('ascii'));
                response = { ...rawResponse, favicon: rawResponse.favicon?.slice('22').replace('\n', '')};
                client.destroy();
                response.ping = latency;
                resolve(response);
            }
        });
        
        client.on('error', (err) => {
            client.destroy();
            reject(err);
        });

        client.on('timeout', () => {
            client.destroy();
            reject('Timed out');
        });
    });
} 