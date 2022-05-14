// 鱼雷本身的控制

// var bCtrl = require("B-MainCtrl");

cc.Class({
    extends: cc.Component,

    properties: {
        speed: { type: cc.Float, default: 100, displayName: "射速" },
        damage: { type: cc.Float, default: 10, displayName: "伤害" },
    },



    onLoad() {
        this.nowL = 0; // 当前已走路程
        this.maxL = 0; // 总射程
        this.speedX = 0;
        this.speedY = 0;
        this.bCtrl = cc.find("Game").getComponent("B-MainCtrl");
        this.phy = cc.director.getPhysicsManager(); // 获取物理系统
    },

    // reuse() {
    //     this.reset();
    // },

    reset(x, y, angle, l) { // 重新设置参数，传入坐标角度和射程
        this.node.setPosition(x, y); // 设置坐标
        this.node.angle = angle;

        this.maxL = l;
        this.nowL = 0;
        this.speedX = this.speed * Math.cos(this.node.angle * Math.PI / 180);
        this.speedY = this.speed * Math.sin(this.node.angle * Math.PI / 180);
        // cc.log("reset");
    },

    update(dt) {
        this.nowTime += dt;
        this.node.x += this.speedX * dt;
        this.node.y += this.speedY * dt;
        this.nowL += this.speed * dt;
        // 碰撞检测
        this.collisionTest();
        // 射程检测
        if (this.nowL >= this.maxL) {
            this.bCtrl.torpedoReturn(this.node);
        }
    },

    collisionTest() { // 每帧执行的碰撞检测
        let n = this.phy.testPoint(this.node.position); // 对本点坐标作点测试
        if (n != null) {
            if (n.node.group == "ship") { // 若命中的是船
                let c = n.getComponent("ShipCtrl");
                c.life.hp -= this.damage; // 扣血
            }
            this.bCtrl.torpedoReturn(this.node);
        }
    },
});
