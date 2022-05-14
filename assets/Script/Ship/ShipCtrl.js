// 船 主控制器


var weaponCtrl = require("WeaponCtrl");
// 属性类
var weaponOne = cc.Class({ // 控制每个武器
    name: "weaponOne",
    properties: {
        ctrl: { type: weaponCtrl, default: null, displayName: "武器节点" },
        mode: { type: cc.Integer, default: 0, visible: false }, // 模式，0未启用，1启用激活，2正在开火。
    },
});

var weaponGroup = cc.Class({ // 控制一组相同类型的武器
    name: "weaponGroup",
    properties: {
        // 性能参数
        weaponType: { type: cc.Integer, default: 1, displayName: "1炮 2鱼雷" },
        turnSpeed: { type: cc.Float, default: 50, displayName: "回转速度" },
        maxCD: { type: cc.Float, default: 3, displayName: "装填时间" },
        maxL: { type: cc.Float, default: 10000, displayName: "最大射程" },
        minL: { type: cc.Float, default: 500, displayName: "最小射程" },
        fireMinCD: { type: cc.Float, default: 0.05, displayName: "最小开火间隔" },
        // 节点参数
        one: { type: weaponOne, default: [], displayName: "武器组" },
        n: { type: cc.Integer, default: 0, visible: false }, // 储存数组长度
        mode: { type: cc.Integer, default: 0, visible: false }, // 模式，0未启用，1启用激活，2正在开火。
        nowFireCD: { type: cc.Float, default: 0, visible: false }, // 当前开火间隔
    },
});

var weapon = cc.Class({ // 控制所有武器，还包括雷达碰撞盒、敌人节点等。
    name: "weapon",
    properties: {
        group: { type: weaponGroup, default: [], displayName: "武器组" },
        n: { type: cc.Integer, default: 0, visible: false }, // 储存数组长度
        target: { type: cc.Node, default: null, visible: false }, // 目标的坐标
        isFire: { default: false, visible: false }, // 当前这条船是否处于开火状态
    },
});

var engine = cc.Class({ // 引擎，移动属性
    name: "engine",
    properties: {
        // 速度属性
        speed: { type: cc.Float, default: 0, visible: false }, // 强制隐藏。
        speedRation: { type: cc.Float, default: 0, visible: false }, // 速度比例，-0.25~1
        shouldSpeed: { type: cc.Float, default: 0, visible: false }, // 应该达到的速度比例，-0.25~1
        addSpeed: { type: cc.Float, default: 0, visible: false }, // 加速度
        maxAddSpeed: { type: cc.Float, default: 10, displayName: "最大加速度(节秒)" },
        maxSpeed: { type: cc.Float, default: 30, displayName: "最大速度(节)" },
        minSpeed: { type: cc.Float, default: 0, visible: false }, // 预计算最小速度(倒车，负数)
        // 转向属性
        rudder: { type: cc.Float, default: 0, visible: false },
        rudderRation: { type: cc.Float, default: 0, visible: false }, // 舵角比例，-1~1
        shouldLR: { type: cc.Integer, default: 0, visible: false }, // 转向指令，0归零1左2右
        addRudder: { type: cc.Float, default: 0, visible: false },
        maxAddRudder: { type: cc.Float, default: 0.02, displayName: "最大加舵角" },
        maxRudder: { type: cc.Float, default: 0.1, displayName: "最大舵角" },
        turnSlow: { type: cc.Float, default: 0.1, displayName: "转向时减少速度的比例，<1" },
    },
});

var life = cc.Class({ // 生命属性
    name: "life",
    properties: {
        height: { type: cc.Float, default: 30, visible: false }, // 船的“高度”。读取Height子节点自动填写。
        maxHP: { type: cc.Integer, default: 100, displayName: "血量" },
        hp: { type: cc.Integer, default: 1, visible: false }, // 当前血量
    },
});

var id = cc.Class({ // 身份属性
    name: "id",
    properties: {
        name: { default: "默认船名", displayName: "船名" },
        type: { default: "默认船型", displayName: "船型，驱逐巡洋" },
        class: { default: "默认船级", displayName: "船级，055级" },
    },
});

cc.Class({
    extends: cc.Component,
    // 序列号属性检查器
    properties: {
        engine: { type: engine, default: {}, displayName: "引擎与移动属性" },
        autoWeaponIn: { default: true, displayName: "自动加载武器" },
        weapon: { type: weapon, default: {}, displayName: "武器与火控" },
        life: { type: life, default: {}, displayName: "生命属性" },
        id: { type: id, default: null, displayName: "身份属性" },
    },
    // 加载，传入初始目标
    load(tar) {
        // 获取刚体组件
        this.rigidBody = this.node.getComponent(cc.RigidBody);
        this.speedCC = 3; // 速度缩放参数
        this.engine.minSpeed = this.engine.maxSpeed * -0.25;// 预计算倒车速度
        // ***** 自动载入武器组 *****
        if (this.autoWeaponIn) {
            // cc.log(this.node.name + "武器组自动载入");
            for (let i = 1; i < 5; i++) { // 最多4组武器，从1开始计数
                let str = "Weapon" + i;
                let str2 = str + "-1";
                let c = this.node.getChildByName(str2);
                if (c == null) break; // 新的组找不到1号节点，退出循环
                for (let ii = 1; ii < 11; ii++) { // 每组最多10座
                    let str3 = str + "-" + ii;
                    let child = this.node.getChildByName(str3); // 获取子节点
                    if (child == null) break; // 本组找不到更多节点，退出循环
                    let ct = child.getComponent("WeaponCtrl");
                    this.weapon.group[i - 1].one[ii - 1] = new weaponOne; // 在数组这个项上，添加一个新建的weaponOne对象
                    this.weapon.group[i - 1].one[ii - 1].ctrl = ct; // 记录节点的控制组件
                    // cc.log("第" + i + "组" + ii + "个" + this.weapon.group[i - 1].one[ii - 1].ctrl.maxCD); // 将找到的节点加入数组
                }
            }
        }
        // 预先记录对象数组的长度，省得每次访问
        this.weapon.n = this.weapon.group.length;
        for (let i = 0; i < this.weapon.n; i++)
            this.weapon.group[i].n = this.weapon.group[i].one.length;
        // 初始化身上的武器
        for (let i = 0; i < this.weapon.n; i++) { // 遍历武器组
            this.weapon.group[i].mode = 0; // 未激活状态
            for (let ii = 0; ii < this.weapon.group[i].n; ii++) { // 遍历本组武器
                this.weapon.group[i].one[ii].ctrl.load(); // 调用加载
                this.weapon.group[i].one[ii].ctrl.weaponType = this.weapon.group[i].weaponType;
                this.weapon.group[i].one[ii].ctrl.turnSpeed = this.weapon.group[i].turnSpeed;
                this.weapon.group[i].one[ii].ctrl.maxCD = this.weapon.group[i].maxCD;
                this.weapon.group[i].one[ii].ctrl.maxL = this.weapon.group[i].maxL;
                this.weapon.group[i].one[ii].ctrl.minL = this.weapon.group[i].minL;
            }
        }
        cc.log(this.node.name + "武器自动加载完成");
        // 载入高度
        let c = this.node.getChildByName("Height"); // 找到标示高度的子节点
        if (c != null) {
            this.life.height = c.z;
            // cc.log("船高度" + this.life.height);
            c.destroy(); // 用完就删除节点
        }
        // 载入血量
        this.life.hp = this.life.maxHP;
        cc.log(this.node.name + "控制载入完成,武器组数量" + this.weapon.n);
        // 载入初始目标
        this.resetTarget(tar);
    },
    // start() {

    // },
    // 每帧刷新
    update(dt) {
        // 计算比值
        this.engine.speedRation = this.engine.speed / this.engine.maxSpeed;
        this.engine.rudderRation = this.engine.rudder / this.engine.maxRudder;
        // 控制
        // this.ChangeSpeedRudder();
        // 移动
        this.move(dt);
        // 开火
        this.firing(dt);
    },

    /*************************/
    /*****   移动控制   ******/
    /************************/

    move(dt) { // 每帧根据轮机参数，控制位移
        // 根据控制指令改变加舵量
        if (this.engine.shouldLR == 0) {
            if (Math.abs(this.engine.rudderRation) < 0.01) // 防止抖动
                this.engine.addRudder = this.engine.rudderRation
                    = this.engine.rudder = 0;
            else if (this.engine.rudderRation < 0)
                this.engine.addRudder = this.engine.maxAddRudder;
            else if (this.engine.rudderRation > 0)
                this.engine.addRudder = -this.engine.maxAddRudder;
        }
        else if (this.engine.shouldLR == 1) // 左转
            this.engine.addRudder = this.engine.maxAddRudder;
        else if (this.engine.shouldLR == 2)
            this.engine.addRudder = -this.engine.maxAddRudder;
        let r = this.engine.rudder + this.engine.addRudder * dt;
        this.engine.rudder = cc.misc.clampf(r, this.engine.maxRudder, -this.engine.maxRudder); // 这个函数限制浮点数的最大最小值。
        // 根据控制指令改变加速度
        if (Math.abs(this.engine.speedRation - this.engine.shouldSpeed) < 0.002) // 防止抖动
            this.engine.speed = this.engine.shouldSpeed * this.engine.maxSpeed;
        else if (this.engine.speedRation < this.engine.shouldSpeed) // 根据差距值决定加减速
            this.engine.addSpeed = this.engine.maxAddSpeed;
        else if (this.engine.speedRation > this.engine.shouldSpeed)
            this.engine.addSpeed = -this.engine.maxAddSpeed;
        // 根据加速度和转向减速计算实际速度
        let s = this.engine.speed + this.engine.addSpeed * dt;
        this.engine.speed = cc.misc.clampf(s, this.engine.maxSpeed, this.engine.minSpeed);// 减去减速比例
        // 加速度归零
        this.engine.addSpeed = 0;
        // 转弯
        let angle = this.node.angle + this.engine.rudder * this.engine.speed * dt * 5; // 5为暂定加速系数
        angle = this.angleMaxMin(angle); // 检查越界
        this.node.angle = angle;
        // 位移
        let rad = angle * Math.PI / 180;// 角度转弧度
        let sp = this.engine.speed * 5 * dt; // 5为暂定加速系数
        let dx = sp * Math.cos(rad); // 本帧xy位移
        let dy = sp * Math.sin(rad);
        this.node.x += dx;
        this.node.y += dy;
    },

    setSpeed(s) { // 外部调用，直接控制速度。输入-0.25~1。
        this.engine.shouldSpeed = s;
        // cc.log("控制" + s);
    },

    setLR(s) { // 外部调用，传入改变舵量的指令，1加，2减，0恢复。没有下一条通知前持续。
        this.engine.shouldLR = s;
    },

    commandSpeed(b) { // 外部调用，传入加减速度的指令，true加速，false减速
        if (b) {
            this.engine.addSpeed = this.engine.maxAddSpeed;
        } else {
            this.engine.addSpeed = -this.engine.maxAddSpeed;
        }
    },

    angleMaxMin(x) { // 查看角度是否越界的函数
        if (x > 180) return x - 360;
        else if (x < -180) return x + 360;
        else return x;
    },

    /*************************/
    /*****   攻击控制   ******/
    /************************/

    firing(dt) { // 每帧执行的攻击
        if (!this.weapon.isFire) return;
        for (let i = 0; i < this.weapon.n; i++) { // 遍历武器组
            if (this.weapon.group[i].mode == 2) { // 遍历，找到开火状态中的组
                if (this.weapon.group[i].nowFireCD > 0) { // 检测是否走完最小开火间隔
                    this.weapon.group[i].nowFireCD -= dt;
                    return;
                }
                this.weapon.group[i].nowFireCD = this.weapon.group[i].fireMinCD;
                for (let ii = 0; ii < this.weapon.group[i].n; ii++) { // 遍历武器
                    let c = this.weapon.group[i].one[ii].ctrl;
                    if (c.canFire()) { // 找到一个待发的武器
                        c.isFire = true; // 设为开火状态
                        c.justFireOnce = true; // 仅开火一次
                        return;
                    }
                }
                return;
            }
        }
    },

    fireStart() { // 命令开始攻击，可在按下按钮时触发
        this.weapon.isFire = true;
        for (let i = 0; i < this.weapon.n; i++) { // 遍历武器组
            if (this.weapon.group[i].mode == 1) { // 遍历，找到启用激活的组
                this.weapon.group[i].mode = 2; // 转为发射中状态
                this.weapon.group[i].nowFireCD = 0; // 重置开火间隔cd
            }
        }

    },

    fireStop() { // 命令停止攻击，可在松开按钮时触发
        this.weapon.isFire = false;
        for (let i = 0; i < this.weapon.n; i++) { // 遍历武器组
            if (this.weapon.group[i].mode == 2) { // 遍历，找到发射中的组
                this.weapon.group[i].mode = 1; // 转为激活状态
                // 整组武器的节点控制组件设为非发射状态
                for (let ii = 0; ii < this.weapon.group[i].n; ii++) {
                    let c = this.weapon.group[i].one[ii].ctrl;
                    c.isFire = false;
                    c.justFireOnce = false;
                }
            }
        }
    },

    fireChange(g) { // 命令切换武器组，g为切换后的组
        for (let i = 0; i < this.weapon.n; i++) { // 遍历武器组
            if (i != g) { // i不是要切换的组
                if (this.weapon.group[i].mode == 2) { // 若正在发射，遍历节点组件，设为非发射状态
                    for (let ii = 0; ii < this.weapon.group[i].n; ii++) {
                        this.weapon.group[i].one[ii].ctrl.isFire = false;
                    }
                }
                this.weapon.group[i].mode = 0; // 转为休眠状态
            } else { // i是要切换的组
                this.weapon.group[i].mode = 1; // 转为激活状态
            }
        }
    },


    resetTarget(t) { // 更换所有武器的目标
        for (let i = 0; i < this.weapon.n; i++) {
            for (let ii = 0; ii < this.weapon.group[i].n; ii++) {
                let c = this.weapon.group[i].one[ii].ctrl;
                c.target = t;
            }
        }
    },

    getWeaponGroup() { // 返回当前第一个激活或射击的武器组
        for (let i = 0; i < this.weapon.n; i++)
            if (this.weapon.group[i].mode == 1 || this.weapon.group[i].mode == 2) {
                return i;
            }
        return 99; // 99为无激活
    },
});
