// imports for server
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import path from 'path';
import fs from 'fs';
const app = express();
app.use(cors({ origin: '*' }));
const server = http.createServer(app);
const io = new Server(server);
// dir and filenames
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// imports for phaser
import '@geckos.io/phaser-on-nodejs';
import { SnapshotInterpolation } from '@geckos.io/snapshot-interpolation';
const SI = new SnapshotInterpolation();
import Phaser from 'phaser';
// imports for entities
import Avatar from '../client/entities/Avatar.js';
import Block from '../client/entities/Block.js';
// imports for assets
const stageBlocks = Object.values(JSON.parse(fs.readFileSync(__dirname + '/../client/stages/01.json', 'utf8')));
// imports for scenes
class ServerScene extends Phaser.Scene {
    constructor() {
        super();
        this.tick = 0;
        this.blockID = 0;
        this.players = new Map();
        this.blocks = new Map();
    }
    preload() {
    }
    create() {
        this.matter.world.setBounds(0, 0, 1024, 832);
        // create all blocks
        let rowCount = 0;
        let colCount = 0;
        let blockID = 0;
        stageBlocks.forEach(rows => {
            rows.forEach(colEntry => {
                // "b"reakable blocks have a tiny chance of not being created. "e"dge and "s"tatic always are
                if (colEntry === "e" || colEntry === "s" || (colEntry === "b" && Math.random() > 0.05)) {
                    let blockEntity = new Block({ scene: this, x: (colCount * 64), y: (rowCount * 64), serverMode: true, blockType: colEntry });
                    blockID = this.blockID;
                    this.blocks.set(blockID, {
                        blockID,
                        blockEntity
                    });
                    this.blockID++;
                }
                colCount++;
            });
            colCount = 0;
            rowCount++;
        });
        io.on('connection', socket => {
            const x = Math.random() * 180 + 40;
            const y = Math.random() * 180 + 40;
            const avatar = new Avatar({ scene: this, x: x, y: y, serverMode: true });
            this.players.set(socket.id, {
                socket,
                avatar
            });
            socket.on('movement', movement => {
                const { left, right, up, down } = movement;
                const speed = 16;
                if (left)
                    avatar.setVelocityX(-speed);
                else if (right)
                    avatar.setVelocityX(speed);
                else
                    avatar.setVelocityX(0);
                if (up)
                    avatar.setVelocityY(-speed);
                else if (down)
                    avatar.setVelocityY(speed);
                else
                    avatar.setVelocityY(0);
            });
            socket.on('disconnect', reason => {
                const player = this.players.get(socket.id);
                player.avatar.destroy();
                this.players.delete(socket.id);
            });
        });
    }
    update() {
        this.tick++;
        // only send the update to the client at 15 FPS (save bandwidth)
        if (this.tick % 4 !== 0)
            return;
        // get an array of all avatars
        const avatars = [];
        this.players.forEach(player => {
            const { socket, avatar } = player;
            avatars.push({ id: socket.id, x: avatar.x, y: avatar.y });
        });
        // get an array of all blocks
        const blocksArr = [];
        this.blocks.forEach(block => {
            const { blockID, blockEntity } = block;
            blocksArr.push({ id: blockID, x: blockEntity.x, y: blockEntity.y, blockType: blockEntity.blockType });
        });
        const worldState = {
            players: avatars,
            blocks: blocksArr
        };
        const snapshot = SI.snapshot.create(worldState);
        SI.vault.add(snapshot);
        // send all avatars and blocks to all players
        this.players.forEach(player => {
            const { socket } = player;
            socket.emit('snapshot', snapshot);
        });
    }
}
const config = {
    type: Phaser.HEADLESS,
    width: 1024,
    height: 832,
    zoom: 1,
    banner: false,
    audio: false,
    scene: [ServerScene],
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 0 },
            debug: false,
            debugBodyColor: 0xff00ff
        },
    }
};
new Phaser.Game(config);
app.use('/', express.static(path.join(__dirname, '../client')));
if (import.meta.env.PROD)
    app.listen(3000);
export const viteNodeApp = app;
