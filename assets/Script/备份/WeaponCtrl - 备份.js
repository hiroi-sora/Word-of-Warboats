// 武器控制的基类

// 用工厂模式，创建有和无死区条件下的转炮函数，赋给接口的实体类。

// 属性类
// var theDiedAngle = cc.Class({ // 死区。open:false为360°模式。
//     name: "theDiedAngle",
//     properties: {
//         open: false,
//         max: 0,
//         min: 0,
//     },
// });
var theShootAngle = cc.Class({ // 可射击区域角度
    name: "shootAngle",
    properties: {
        max: 0,
        min: 0,
    },
});

var BDn = require("B-MainCtrl");

cc.Class({
    extends: cc.Component,

    properties: {
        ctrlDn: { type: BDn, default: null, displayName: "投射物管理组件" },
        turnSpeed: { type: cc.Float, default: 10, displayName: "回转速度" },
        maxCD: { type: cc.Float, default: 5, displayName: "装填时间" },
        shootAngle: { type: theShootAngle, default: [], displayName: "射界(弧度)" },
        diedAngleMax: 0,
        diedAngleMin: 0,
    },


    onLoad() {
        this.open = false; // 启用值
        this.shootType = 0; // 当前射击状态，0可射击，1在射界内但无法射击，2不在射界内
        this.nowAngle = this.node.angle; // 当前角度
        this.shouleAngle = this.nowAngle; // 应该去到的角度
        this.扩散角a = 1;
        this.扩散角 = this.扩散角a * Math.PI / 180; // 角度转弧度
        this.diedAngleHalf = (this.diedAngleMax + this.diedAngleMin) / 2; // 死区的中值
        if (this.diedAngleMax < this.diedAngleMin) // 若死区为反向
            this.diedAngleHalf = this.diedAngleHalf == 0 ? 180 : this.diedAngleHalf - 180;
        this.V2 = cc.v2(this.node.x, this.node.y); // 本节点世界坐标
        // 武装属性
        this.nowCD = 0; // 当前cd
        this.poi = this.node.children; // 获取所有子节点
        // 绘图
        this.father = this.node.parent;
        this.canvas = cc.Canvas.instance.node;
        this.graphics = cc.find("Canvas/Player UI").getComponent(cc.Graphics); // 获取绘图组件
        this.UiAngleR = 280; // 当前角度指示的中心半径
        this.UiAngleLen = 440; // 当前角度指示的宽度
        this.UishootR = 100; // 射界指示扇形的中心半径
        this.UishootLen = 60; // 射界指示扇形的宽度
        this.UilineMin = cc.v2(100, 0);
        this.UilineMax = cc.v2(1000, 0);
        // 颜色预设定
        this.color0 = new cc.Color(0, 255, 0, 100); // 0绿，可射击
        this.color1 = new cc.Color(255, 255, 0, 100); // 1黄，装填/转动中
        this.color2 = new cc.Color(180, 180, 180, 100); // 2灰，不可射击
        this.color01 = new cc.Color(0, 255, 0, 30); // 透明度更低的0
        this.color21 = new cc.Color(180, 180, 180, 30);
        this.colorLine = new cc.Color(200, 200, 200, 255); // 指示线
    },
    // start() {
    //     cc.log("投射物管理组件" + this.ctrlDn.pool.size());
    // },

    setReady() { // 激活，显示UI
        this.open = true;
    },
    setOff() { // 关闭激活
        this.open = false;
    },
    setXY(x, y) { // 设置绝对坐标
        // this.V2
        let v = cc.v2(this.V2.x - x, y - this.V2.y);
        let rightV2 = cc.v2(0, 1);    // 水平向右的对比向量，以最大距离为单位
        let radian = v.signAngle(rightV2);    // 触点坐标的弧度
        let ang = cc.misc.radiansToDegrees(radian) - this.father.angle + 90;
        if (ang > 180) ang -= 360;
        else if (ang < -180) ang += 360;
        this.shouleAngle = ang;
    },
    // setAngle(a) { // 设置角度，相对于船身
    //     this.shouleAngle = a;
    // },
    setFire() { // 射击，关闭激活
        this.open = false;
        if (this.nowCD > 0) {
            cc.log("错误：" + this.node.name + "的cd未归零就开火！");
            return;
        }
        this.nowCD = this.maxCD;
        cc.log(this.node.name + "开火！");
        for (var i = 0; i < this.poi.length; i++) {
            let worldV2 = this.canvas.convertToNodeSpaceAR( // 计算坐标
                this.node.convertToWorldSpaceAR(cc.v2(this.poi[i].x, this.poi[i].y))
            );
            // 通知对象池，发——射——！！！！！！！
            this.ctrlDn.outPool(0, worldV2.x, worldV2.y, this.node.angle + this.father.angle);
        }
    },

    weaponUpdate(dt) { // 每帧更新要手动调用
        this.V2 = this.canvas.convertToNodeSpaceAR( // 计算本节点世界坐标
            this.father.convertToWorldSpaceAR(cc.v2(this.node.x, this.node.y))
        );
        if (this.node.angle != this.shouleAngle) { // 当前角度不等于目标角
            this.turn(dt); // 执行转动
            this.shootType = 1; // 1：不可开火
        }
        // cd
        if (this.nowCD > 0) this.nowCD -= dt;
        else this.nowCD = 0;
        // 非激活状态下，对准方位就行了，不用绘制ui
        if (!this.open) return;
        if (Math.abs(this.node.angle - this.shouleAngle) <= this.扩散角a) {
            this.shootType = 0;
        }
        // 遍历射界，检查是否在射界内
        let r = cc.misc.degreesToRadians(this.node.angle); // 当前角度的弧度，要加上父节点
        let l = this.shootAngle.length;
        let b = true;
        for (let i = 0; i < l; i++) {
            if (r > this.shootAngle[i].min && r < this.shootAngle[i].max) {
                b = false;
                break;
            }
        }
        if (b) this.shootType = 2;
        // 绘制指示UI
        this.draw();
    },

    turn(dt) { // 执行转动
        let a = this.node.angle; // 当前角度
        let j = a - this.shouleAngle; // 当前角与目标的夹角
        if (Math.abs(j) < 1) { // 1度归零
            a = this.shouleAngle;
        } else {
            if ((j < 180 && j >= 0) || (j < -180 && j >= -360)) { // 若夹角大于180，显然朝另一个方向旋转更快。
                a -= this.turnSpeed * dt;
            } else {
                a += this.turnSpeed * dt;
            }
        }
        if (a > 180) a -= 360;
        else if (a < -180) a += 360;
        this.node.angle = a;
        // cc.log(a.toFixed(1) + "往" + this.shouleAngle.toFixed(1));
    },

    draw() { // 绘制火力指示UI
        // this.graphics.clear(); // 清屏
        // 通用参数
        let fr = cc.misc.degreesToRadians(this.father.angle); // 当前父节点角度的弧度
        // 计算射界指示扇形诸元
        let l = this.shootAngle.length; // 数组长度
        this.graphics.lineWidth = this.UishootLen; // 改变线宽
        for (let i = 0; i < l; i++) {
            this.graphics.arc(this.V2.x, this.V2.y, this.UishootR,
                this.shootAngle[i].min + fr, this.shootAngle[i].max + fr, true);
        }
        this.graphics.strokeColor = this.color01;
        this.graphics.stroke(); // 先描边，防止后面宽度覆盖
        // 绘制当前方位扇形诸元
        let r = cc.misc.degreesToRadians(this.node.angle) + fr; // 当前角度的弧度，要加上父节点
        let rMax = r + this.扩散角;
        let rMin = r - this.扩散角;
        this.graphics.lineWidth = this.UiAngleLen; // 改变线宽
        this.graphics.arc(this.V2.x, this.V2.y, this.UiAngleR,
            rMin, rMax, true);
        switch (this.shootType) { // 当前武器射击
            case 0:
                this.graphics.strokeColor = this.color0;
                break;
            case 1:
                this.graphics.strokeColor = this.color1;
                break;
            case 2:
                this.graphics.strokeColor = this.color2;
                break;
        }
        this.graphics.stroke(); // 先描边，防止后面宽度覆盖
        // 绘制目标方位指示
        let shouldR = cc.misc.degreesToRadians(this.shouleAngle);
        let lmax = this.UilineMax.rotate(shouldR);
        let lmin = this.UilineMin.rotate(shouldR);
        let minV2 = this.canvas.convertToNodeSpaceAR( // 将世界坐标转换为相对canvas的坐标
            this.father.convertToWorldSpaceAR(cc.v2(this.node.x + lmin.x, this.node.y + lmin.y)) // 将本节点坐标转换为世界坐标
        );
        let maxV2 = this.canvas.convertToNodeSpaceAR(
            this.father.convertToWorldSpaceAR(cc.v2(this.node.x + lmax.x, this.node.y + lmax.y))
        );
        this.graphics.lineWidth = 3;// 线宽
        this.graphics.moveTo(minV2.x, minV2.y);
        this.graphics.lineTo(maxV2.x, maxV2.y);
        this.graphics.strokeColor = this.colorLine; // 颜色
        this.graphics.stroke(); // 描边，fill();填充 
    },
});
