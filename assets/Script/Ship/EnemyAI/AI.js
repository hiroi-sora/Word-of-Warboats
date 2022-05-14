// 暂时用着先，敌人的ai

var ship = require("ShipCtrl");

cc.Class({
    extends: cc.Component,

    properties: {
        target: { type: cc.Node, default: null, displayName: "目标，玩家" },
        // toleranceRad: { type: cc.Float, default: 0, displayName: "目标，玩家" },
    },

    // LIFE-CYCLE CALLBACKS:

    load(p) {
        if (p != null)
            this.target = p;
        this.open = false; // 启动标志
        this.ship = this.node.getComponent("ShipCtrl");
        this.targetRadian = 0; // 目标的弧度夹角
        this.targetAngle = 0; // 目标的角度
        this.toleranceRad = 0.1; // 允许容差的弧度
    },

    start() {
        // this.setOpen();
    },

    update(dt) {
        if (!this.open) return;
        let v = this.node.convertToNodeSpaceAR(this.target.position); // 将世界坐标转为船节点坐标
        this.targetRadian = cc.v2(cc.Vec2.RIGHT_R).signAngle(v); // 获得目标的弧度
        if (this.targetRadian > this.toleranceRad) {
            this.ship.setLR(1);
        } else if (this.targetRadian < -this.toleranceRad) {
            this.ship.setLR(2);
        } else {
            this.ship.setLR(0);
        }
    },

    setOpen() { // 设置打开ai
        this.open = true; // 开启启动标志
        this.ship.setSpeed(1); // 启动轮机，设定最大战速
        for (let i = 0; i < this.ship.weapon.n; i++) { // 遍历武器组
            for (let ii = 0; ii < this.ship.weapon.group[i].n; ii++) { // 遍历武器
                this.ship.weapon.group[i].one[ii].ctrl.isFire = true; // 设为开火状态
            }
        }
    },

    setOff() { // 设置关闭ai
        this.open = false;
        this.ship.setSpeed(0);
        for (let i = 0; i < this.ship.weapon.n; i++) {
            for (let ii = 0; ii < this.ship.weapon.group[i].n; ii++) {
                this.ship.weapon.group[i].one[ii].ctrl.isFire = false;
            }
        }
    },
});
