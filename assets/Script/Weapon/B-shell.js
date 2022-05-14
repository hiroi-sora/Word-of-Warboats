// 炮弹本身的控制

cc.Class({
    extends: cc.Component,

    properties: {
        speed: { type: cc.Float, default: 100, displayName: "射速" },
        maxL: { type: cc.Float, default: 100, displayName: "射程" },
        maxH: { type: cc.Float, default: 25, displayName: "射高" },
        damage: { type: cc.Float, default: 5, displayName: "伤害" },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.shell = this.node.children[0]; // 子节点
        this.nowL = 0; // 当前路程
        this.speedX = 0;
        this.speedY = 0;
        this.bCtrl = cc.find("Game").getComponent("B-MainCtrl");
        // 初始高度(出发点h)和中点高度
        this.h0 = 10; // 恒定
        this.halfH = 0;
        // 求出中点高度函数的系数。恒定值。
        this.halfB = 0.5 * this.h0;
        this.halfK = (this.maxH - this.halfB) / (this.maxL * 0.5);
        // 弹道诸元。二次函数的各项系数。
        this.bA = 0;
        this.bB = 0;
        this.bC = 0;
        // 属于这枚炮弹的拖尾节点组件
        this.trail;
        // 获取物理系统
        this.phy = cc.director.getPhysicsManager();
    },

    // reuse() {
    //     this.reset();
    // },

    reset(x, y, angle, l, h) { // 重新设置参数，传入世界坐标角度angle，路程l，高度h
        // 坐标角度
        this.node.setPosition(x, y); // 设置坐标
        this.node.angle = angle;
        // 计算XY速度分量
        this.speedX = this.speed * Math.cos(angle * Math.PI / 180);
        this.speedY = this.speed * Math.sin(angle * Math.PI / 180);
        // 参数归零
        this.nowL = 0; // 当前路程
        this.h0 = h;
        this.shell.z = h; // 炮弹模型高度
        // 中点函数，计算中点高度h。h=0.5lk+b
        this.halfH = this.halfK * l * 0.5 + this.halfB;
        // 弹道解算函数，根据总路程，计算弹道诸元。
        this.bA = 2 * (this.h0 - 2 * this.halfH) / (l * l);
        this.bB = (4 * this.halfH - 3 * this.h0) / l;
        this.bC = this.h0;

        // cc.log("射程" + l + "中点高度" + this.halfH
        //     + "诸元: y=" + this.bA + "*x^2+" + this.bB + "*x+" + this.bC + ",");
    },

    update(dt) {
        // 计算真实位移
        this.node.x += this.speedX * dt;
        this.node.y += this.speedY * dt;
        // 计算路程与当前高度
        this.nowL += this.speed * dt; // 当前路程
        this.shell.z = this.bA * this.nowL * this.nowL + this.bB * this.nowL + this.bC; // 当前高度
        // 碰撞检测
        this.collisionTest();
        if (this.shell.z <= 0) { // 落到低于水平线
            this.returnPool();
        }
    },

    collisionTest() { // 每帧执行的碰撞检测
        let n = this.phy.testPoint(this.node.position); // 对本点坐标作点测试
        if (n != null) {
            if (n.node.group == 'ship') {
                let c = n.getComponent("ShipCtrl");
                if (this.shell.z <= c.life.height) { // 炮弹高度低于船高度，才命中
                    c.life.hp -= this.damage; // 扣血
                    this.returnPool();
                }
            } else if (n.node.group == 'map') {
                if (n.node.children[0] != null)
                    if (this.shell.z <= n.node.children[0].z) { // 炮弹高度低于岛高度，命中
                        this.returnPool();
                    }
            }
        }
    },

    returnPool() { // 将本节点返回对象池
        // 回收对象
        this.bCtrl.shellReturn(this.node);
        // 停止拖尾
        this.trail.autoStop();
    },
});


// getHalfH(l) { // 中点函数，输入本次弹道路程，写入中点高度h。h=0.5lk+b
//     this.halfH = this.halfK * l * 0.5 + this.halfB;
// },

// getBallistic(l) { // 弹道解算函数，输入本次路程，填写弹道诸元。
//     this.bA = 2 * (this.h0 - 2 * this.halfH) / (l * l);
//     this.bB = (4 * this.halfH - 3 * this.h0) / l;
//     this.bC = this.h0;
// },