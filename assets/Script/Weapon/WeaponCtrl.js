// 武器控制

// 属性类
var theSafeAngle = cc.Class({ // 可射击区域角度
    name: "theSafeAngle",
    properties: {
        maxAng: 180,
        minAng: -180,
        maxRad: { type: cc.Float, default: 0, visible: false },
        minRad: { type: cc.Float, default: 0, visible: false },
    },
});

var theLimitAngle = cc.Class({ // 死区(限制区)角度。武器不能转动到该角度上。
    name: "theLimitAngle",
    properties: {
        maxAng: { type: cc.Float, default: -180, displayName: "死区扇形上界，顺时针的起点" },
        minAng: { type: cc.Float, default: 180, displayName: "死区扇形下界，顺时针的终点" },
        halfAng: { type: cc.Float, default: 0, visible: false }, // 死区扇区的中界
        halfRad: { type: cc.Float, default: 0, visible: false },
        maxRad: { type: cc.Float, default: 0, visible: false },
        minRad: { type: cc.Float, default: 0, visible: false },
    },
});

// var bCtrl = require("B-MainCtrl");

cc.Class({
    extends: cc.Component,
    properties: {
        // ***** 以下参数在船的start()里被再次初始化
        weaponType: { type: cc.Integer, default: 1, displayName: "类型，1火炮 2鱼雷" },
        turnSpeed: { type: cc.Float, default: 10, displayName: "回转速度" },
        maxCD: { type: cc.Float, default: 5, displayName: "装填时间" },
        maxL: { type: cc.Float, default: 10000, displayName: "最大射程" },
        minL: { type: cc.Float, default: 500, displayName: "最小射程" },
        // *****
        openSafe: { default: false, displayName: "是否开启安全区" },
        safeAngle: { type: theSafeAngle, default: [], displayName: "安全射界" },
        openLimit: { default: false, displayName: "是否开启死区" },
        limitAngle: { type: theLimitAngle, default: null, displayName: "死区角度" },
        target: { type: cc.Node, default: null, displayName: "目标" },
    },

    load() {
        this.nowAngle = this.node.angle; // 当前角度
        // 父节点是船
        this.ship = this.node.parent;
        cc.log("武器父节点" + this.ship.name);
        // 目标
        this.targetV2 = cc.v2(0, 0);
        this.targetAngle = 0; // 目标角度。基于本节点坐标系，受本节点角度影响。
        this.targetRadian = 0; // 目标弧度
        // 火力属性
        this.isFire = false; // 开火指令，true则处于连续开火状态下
        this.justFireOnce = false; // 为t时仅仅开火一次，然后把isFire和自身置为f
        ///////////////////////////////////////////////////////////////  测试测试
        // if (this.ship.name == "Enemy1" || this.ship.name == "Enemy2") this.isFire = true;
        ///////////////////////////////////////////////////////////////  测试测试
        this.nowCD = 0; // 当前cd
        this.poi = this.node.children; // 获取所有子节点
        // 子弹管理节点和组件
        let bulletNode = cc.find("Game");
        this.bulletCtrl = bulletNode.getComponent("B-MainCtrl");
        // 加载分炮口子节点
        this.poi = new Array(); // 储存炮口的节点
        this.poiN = 0; // 炮管数量
        for (let i = 1; i < 7; i++) { // 最多6根炮管，从1开始计数
            let str = "Poi" + i;
            let child = this.node.getChildByName(str);
            if (child == null) break; // 找不到更多节点了，就退出循环
            this.poi[this.poiN++] = child; // 将找到的节点加入数组
        }
        // 加载炮口离地高度
        this.poiH = 0; // 默认为0
        let child = this.node.getChildByName("Height");
        if (child != null) {
            this.poiH = child.z; // 获取节点的h
            child.destroy(); // 直接销毁节点，减少性能占用
            // cc.log("高度" + this.poiH);
        }
        // 安全区计算弧度值，cc.misc.degreesToRadians 角度转弧度
        if (this.openSafe) {
            this.safeAngleLength = this.safeAngle.length; // 遍历射界数组
            // cc.log("安全区：");
            for (let i = 0; i < this.safeAngleLength; i++) {
                this.safeAngle[i].maxRad = cc.misc.degreesToRadians(this.safeAngle[i].maxAng);
                this.safeAngle[i].minRad = cc.misc.degreesToRadians(this.safeAngle[i].minAng);
                // cc.log(this.safeAngle[i].maxAng + "~" + this.safeAngle[i].minAng);
            }
        }
        // 计算死区的弧度和中值
        if (this.openLimit) {
            this.limitAngle.maxRad = cc.misc.degreesToRadians(this.limitAngle.maxAng);
            this.limitAngle.minRad = cc.misc.degreesToRadians(this.limitAngle.minAng);
            // 正常情况：起点>终点，中界为上界与下届的平均值
            this.limitAngle.halfAng = (this.limitAngle.maxAng + this.limitAngle.minAng) / 2;
            this.limitAngle.halfRad = (this.limitAngle.maxRad + this.limitAngle.minRad) / 2;
            // 若起点<终点，此时死区跨越了180/-180分界线；中界要减一下180
            if (this.limitAngle.maxAng < this.limitAngle.minAng) {
                this.limitAngle.halfAng = this.limitAngle.halfAng - 180;
                this.limitAngle.halfRad = Math.PI - this.limitAngle.halfAng;
            }
            this.crossBoundary = false; // 死区是否跨越分界线，max ~ (-180,180) ~ min
            if (this.limitAngle.maxAng < this.limitAngle.minAng)
                this.crossBoundary = true;
            this.compareHalfWithMax = true; // 优先用max还是min与half比较，true为max
            if (this.limitAngle.maxAng < 0 && this.limitAngle.minAng > 0 && this.limitAngle.halfAng > 0)
                this.compareHalfWithMax = false; // max与min跨越分界且half偏向正数的一方min，则优先与min比较
            // cc.log("*****死区跨越分界线：" + this.crossBoundary + "优先与max比较:" + this.compareHalfWithMax + " 半：" + this.limitAngle.halfAng);
        }

        // 从工厂模式获取转动方法的对象
        this.goturn = this.getTurn(this);

        // cc.log("武器控制" + this.node.name + "组件加载完毕，当前方向" + this.targetRadian);
    },

    update(dt) {
        // 目标坐标，当前为测试节点坐标
        if (this.target != null)
            this.targetV2 = this.target.position;
        // 获取转动角度
        this.getTurnAngle();
        // 执行转动
        this.goturn.go(dt);
        // 开火
        this.autoFire(dt);
    },

    // 工厂模式，创建有和无限制条件下的转动函数，返回给接口的实体类。
    // inThis：传入this，让内部函数获取节点和脚本信息。
    getTurn(inThis) {
        // 无限制
        var noLimit = {};
        noLimit.is = inThis;
        noLimit.go = function (dt) {
            // 根据角度调整指令
            let a = this.is.node.angle; // 当前角度
            let j = this.is.targetAngle - a; // 当前角与目标的夹角
            let t = this.is.turnSpeed * dt;
            if (Math.abs(j) <= t) { // 小于本帧能达到的度数，就归零
                a = this.is.targetAngle;
            } else {
                if ((j < 180 && j >= 0) || (j < -180 && j >= -360)) { // 若夹角大于180，显然朝另一个方向旋转更快。
                    a += t;
                } else {
                    a -= t;
                }
            }
            if (a > 180) a -= 360;
            else if (a < -180) a += 360;
            this.is.node.angle = a;
        }
        // 有限制
        var haveLimit = {};
        haveLimit.is = inThis;
        haveLimit.go = function (dt) {
            // 计算shouldAngle，判断targetAngle是否出界
            let shouldAngle;
            if (this.is.crossBoundary) { // 死区跨越了分界线
                if (this.is.targetAngle <= this.is.limitAngle.minAng && this.is.targetAngle >= this.is.limitAngle.maxAng) {
                    shouldAngle = this.is.targetAngle;
                } else if (this.is.compareHalfWithMax) { // 优先与max比较
                    if (this.is.targetAngle <= this.is.limitAngle.maxAng && this.is.targetAngle > this.is.limitAngle.halfAng) {
                        shouldAngle = this.is.limitAngle.maxAng + 0.001;
                    } else {
                        shouldAngle = this.is.limitAngle.minAng - 0.001;
                    }
                } else { // 优先与min比较
                    if (this.is.targetAngle >= this.is.limitAngle.minAng && this.is.targetAngle < this.is.limitAngle.halfAng) {
                        shouldAngle = this.is.limitAngle.minAng - 0.001; // 加一点点小数，防止重合
                    } else {
                        shouldAngle = this.is.limitAngle.maxAng + 0.001;
                    }
                }
            } else { // 死区没跨越分界线
                if (this.is.targetAngle >= this.is.limitAngle.maxAng || this.is.targetAngle <= this.is.limitAngle.minAng) {
                    shouldAngle = this.is.targetAngle;
                } else if (this.is.compareHalfWithMax) { // 优先与max比较
                    if (this.is.targetAngle < this.is.limitAngle.maxAng && this.is.targetAngle > this.is.limitAngle.halfAng) {
                        shouldAngle = this.is.limitAngle.maxAng + 0.001;
                    } else {
                        shouldAngle = this.is.limitAngle.minAng - 0.001;
                    }
                } else { // 优先与min比较
                    if (this.is.targetAngle >= this.is.limitAngle.minAng && this.is.targetAngle < this.is.limitAngle.halfAng) {
                        shouldAngle = this.is.limitAngle.minAng - 0.001; // 加一点点小数，防止重合
                    } else {
                        shouldAngle = this.is.limitAngle.maxAng + 0.001;
                    }
                }
            }
            // 根据角度调整指令
            let a = this.is.node.angle; // 当前角度
            let j = shouldAngle - a; // 当前角与目标的夹角
            let t = this.is.turnSpeed * dt; // 本帧内可以转动的读书，速度*时间
            if (Math.abs(j) <= t) { // 若夹角小于本帧能达到的度数，就直接归零，防止抖动
                a = shouldAngle;
            } else { // 需要朝向目标角旋转
                if (j < 180 && j >= 0) { // 目标在当前角左边，正常应该是增加当前角
                    if (this.is.limitAngle.minAng > a && this.is.limitAngle.minAng < shouldAngle) // 但如果死区夹在目标和当前角中间，就反方向转
                        a -= t;
                    else
                        a += t;
                } else if (j < -180 && j >= -360) { // 目标在当前角左边且跨越了-180~180分界线，正常应该增加当前角
                    if (this.is.limitAngle.minAng > a || this.is.limitAngle.minAng < shouldAngle) // 死区在 (180~当前) 或 (-180~目标)，反转
                        a -= t;
                    else
                        a += t;
                } else if (j < 0 && j >= -180) { // 目标在当前右，正常是减
                    if (this.is.limitAngle.minAng < a && this.is.limitAngle.minAng > shouldAngle) // min在180~a 或 -180~s之间
                        a += t;
                    else
                        a -= t;
                } else if (j < 360 && j >= 180) { // 目标在当前右且跨越分界线，正常是减
                    if (this.is.limitAngle.minAng < a || this.is.limitAngle.minAng > shouldAngle) // min在180~a 或 -180~s之间
                        a += t;
                    else
                        a -= t;
                }
            }
            if (a > 180) a -= 360;
            else if (a < -180) a += 360;
            this.is.node.angle = a;
            // // ****************debug
            // if (this.is.debugLable != null)
            //     this.is.debugLable.string = "s:" + shouldAngle.toFixed(0) + " |a" + a.toFixed(0);
        }
        // 判断this.openLimit；返回给定的对象
        switch (inThis.openLimit) {
            case false:
                return noLimit;
            case true:
                return haveLimit;
        }
    },

    getTurnAngle() { // 根据目标的世界坐标。计算目标角度
        let v = this.ship.convertToNodeSpaceAR(this.targetV2); // 将世界坐标转为船节点坐标
        v.subSelf(this.node.position); // v减去本武器的坐标
        this.targetRadian = cc.v2(cc.Vec2.RIGHT_R).signAngle(v); // 获得目标的弧度
        this.targetAngle = cc.misc.radiansToDegrees(this.targetRadian); // 获得目标的角度
    },

    isInSafe() { // 是否处于安全区内？是返回true
        if (!this.openSafe) return true; // 未开启安全区，直接true
        // 遍历射界，检查是否在射界内
        for (let i = 0; i < this.safeAngleLength; i++) {
            if (this.node.angle <= this.safeAngle[i].maxAng && this.node.angle >= this.safeAngle[i].minAng) {
                // 在任何一个安全区内，就是安全，可以开火
                return true;
            }
        }
        return false;
    },

    isInTarget() { // 是否已对准目标角？是返回true
        let j = this.targetAngle - this.node.angle; // 当前角与目标的夹角
        let t = 1;
        if (Math.abs(j) <= t)
            return true;
        return false;
    },

    canFire() { // 返回除了开火指令外，本武器是否处于待发状态
        if (this.nowCD > 0) return false; // 尚在装填
        if (!this.isInTarget()) return false; // 未对齐目标角
        if (!this.isInSafe()) return false; // 未在安全区内
        let l = this.node.convertToNodeSpaceAR(this.targetV2).x; // 计算射程
        if (l > this.maxL || l < this.minL) return false; // 不在射程内
        return true;
    },

    autoFire(dt) { // 自动开火中
        if (this.nowCD > 0) {
            this.nowCD -= dt;
            return; // 尚在装填
        }
        if (!this.isFire) return; // 未收到开火指令
        if (!this.isInTarget()) return; // 未对齐目标角
        if (!this.isInSafe()) return; // 未在安全区内
        let l = this.node.convertToNodeSpaceAR(this.targetV2).x; // 计算射程
        if (l > this.maxL || l < this.minL) return; // 不在射程内
        if (this.justFireOnce) // 仅开火一次：然后将justFireOnce和isFire置为f，下一次不再开火
            this.justFireOnce = this.isFire = false;
        this.nowCD = this.maxCD; // cd归满

        let worldV2 = this.node.convertToWorldSpaceAR(cc.Vec2.ZERO);
        switch (this.weaponType) {
            case 1: // 火炮
                this.shellFire(l);
                return;
            case 2: // 鱼雷
                this.torpedoFire();
                return;
        }
    },
    shellFire(l) { // 火炮开火的函数，传入射程
        // 计算本次射程
        // let v = this.node.convertToNodeSpaceAR(this.targetV2); // 将目标的世界坐标转为本炮塔节点坐标  
        // cc.log("******本次射程" + v.x);
        for (let i = 0; i < this.poiN; i++) { // 遍历每根炮管         
            // 坐标转换
            let worldV2 = this.node.convertToWorldSpaceAR(this.poi[i].position);
            // 通知投射物管理组件，生成炮弹
            this.bulletCtrl.shellFire(
                worldV2.x, worldV2.y, this.node.angle + this.ship.angle + this.poi[i].angle, l - this.poi[i].x, this.poiH
            );
        }
    },
    torpedoFire() { // 鱼雷开火
        for (let i = 0; i < this.poiN; i++) {
            let worldV2 = this.node.convertToWorldSpaceAR(this.poi[i].position);
            this.bulletCtrl.torpedoFire(worldV2.x, worldV2.y, this.node.angle + this.ship.angle + this.poi[i].angle, this.maxL);
        }
    },
});
