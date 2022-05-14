// 摄像机控制

cc.Class({
    extends: cc.Component,

    properties: {
        ship: { type: cc.Node, default: null, displayName: "跟踪目标节点" },
        skyCamera: { type: cc.Node, default: null, displayName: "天空摄像机节点" },
        // goY: { type: cc.Float, default: 500, displayName: "前后视角时偏移系数" },
    },

    // LIFE-CYCLE CALLBACKS:

    load(p) {
        if (p != null)
            this.ship = p;
        this.move2 = this.node.children[0];
        this.camera = this.move2.children[0];
        this.ctrlAngle = -90; // 控制角
        this.upDownAngle = this.camera.eulerAngles.x; // 上下控制角
        this.height = this.camera.z;
        this.hL = 1; // 高度越高hl越大

        this.maxL = this.move2.y; // 摄像机轨道长轴距离中心长度
        this.minL = this.maxL * 0.6; // 轨道短轴
        this.b180 = this.minL * 2 - this.maxL;// 180~90的加系数
        this.b0 = this.maxL;// 180~90的加系数
        this.k180 = (this.maxL - this.minL) / 90; // 180~90的乘系数
        this.k0 = -this.k180; // 90的系数
        cc.log("摄像机控制载入完成，上下角度" + this.upDownAngle);
    },

    lateUpdate(dt) { // 延迟刷新，防止相机和物体不同步
        this.Move();
    },

    Move() { // 移动控制
        // 本节点坐标与目标同步
        this.node.x = this.ship.x;
        this.node.y = this.ship.y;
        // 角度要加上控制角
        this.node.angle = this.AngleMaxMin(this.ctrlAngle); // 检查一下越界，+this.ship.angle
        // 偏移
        let a = Math.abs(this.AngleMaxMin(this.node.angle - this.ship.angle + 90));
        let l = 0;
        if (a > 90) {
            l = this.k180 * a + this.b180;
        } else {
            l = this.k0 * a + this.b0;
        }
        this.move2.y = l * this.hL;
        // cc.log(this.node.angle + "|" + this.ship.angle);
        // 摄像机上下控制
        this.camera.eulerAngles = new cc.v3(this.upDownAngle, 0, 0);
        this.camera.z = this.height;
        // 天空摄像机控制
        this.skyCamera.eulerAngles = new cc.v3(this.upDownAngle, 0, this.node.angle);
    },

    AngleMaxMin(x) { // 查看角度是否越界的函数
        if (x > 180) return x - 360;
        else if (x < -180) return x + 360;
        else return x;
    },
});
