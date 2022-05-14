// 加载脚本

var CameraCtrl = require("CameraCtrl");

var TurnButtonCtrl = require("TurnButtonCtrl");
var SpeedSliderCtrl = require("SpeedSliderCtrl");
var AimFire = require("AimFire");
var UI_Ship = require("UI_Ship");
var KeyIn = require("KeyIn");

var ShipCtrl = require("ShipCtrl");
var AI = require("AI");

var Help = require("Help");

var shippf = cc.Class({ // 本局要添加的船
    name: "shippf",
    properties: {
        prefab: { type: cc.Prefab, default: null, displayName: "预制体" },
        n: { type: cc.Integer, default: 0, displayName: "数量" },
    },
});

cc.Class({
    extends: cc.Component,

    properties: {
        cameraCtrl: { type: CameraCtrl, default: null, displayName: "摄像机" },
        turnButton: { type: TurnButtonCtrl, default: null, displayName: "转向按钮" },
        speedSlider: { type: SpeedSliderCtrl, default: null, displayName: "油门滑条" },
        aimFire: { type: AimFire, default: null, displayName: "瞄准控制" },
        uiShip: { type: UI_Ship, default: null, displayName: "敌人UI显示" },
        target: { type: cc.Node, default: null, displayName: "瞄准目标节点" },

        playerNode: { type: cc.Node, default: null, displayName: "玩家节点" },
        shipPf: { type: shippf, default: [], displayName: "要添加的船" },

        help: { type: Help, default: null, displayName: "帮助" },
    },

    // LIFE-CYCLE CALLBACKS:


    loadShip(i, x, y) { // 加载一条船，输入种类i、坐标xy，返回ai控制
        let p = cc.instantiate(this.shipPf[i].prefab);
        p.parent = this.node;
        p.x = x;
        p.y = y;
        p.addComponent(AI);
        let c = p.getComponent(ShipCtrl); // 加载船控制器
        c.load(this.playerNode);
        let a = p.getComponent(AI); // 加载ai控制
        a.load(this.playerNode);
        a.setOpen(); // 启动
        this.uiShip.addShip(p); // 载入UI
        return a;
    },

    onLoad() {
        this.player = this.playerNode.getComponent(ShipCtrl);
        // 将玩家控制绑定到player上
        this.cameraCtrl.load(this.playerNode);
        this.turnButton.load(this.player);
        this.speedSlider.load(this.player);
        this.aimFire.load(this.player);
        // 设定目标
        this.player.load(this.target);
        // 加载Ai
        for (let i = 0; i < this.shipPf.length; i++) {
            for (let ii = 0; ii < this.shipPf[i].n; ii++) {
                let a = this.loadShip(i,
                    i * 100 + i * 2000 * Math.random(), ii * 100 + ii * 2000 * Math.random());
                a.setOff(); // 关闭
                this.help.addShip(a);
            }
        }
        this.help.load();
        this.uiShip.load(this.player);
    },

    // start() {

    // },

    // update (dt) {},
});
