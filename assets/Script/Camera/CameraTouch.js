// 3D摄像机控制

var cameraCtrl = require("CameraCtrl");
cc.Class({
    extends: cc.Component,

    properties: {
        cameraCtrl: { type: cameraCtrl, default: null, displayName: "摄像机控制节点" },

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        // 注册本节点的触摸监听
        this.node.on(cc.Node.EventType.TOUCH_START, this.TouchOn, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.TouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.TouchOff, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.TouchOff, this);

        this.id = -1;
        // 上一帧的xy
        this.lastX = 0;
        this.lastY = 0;
        // 最高低点
        this.minH = this.cameraCtrl.height;
        this.maxH = this.minH + 200;
    },
    onDestroy() {
        // 退出时取消监听
        this.node.off(cc.Node.EventType.TOUCH_START, this.TouchOn, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.TouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.TouchOff, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.TouchOff, this);
    },

    update(dt) {

    },


    // 触摸监控
    TouchOn(event) { // 按下
        if (this.id != -1) return; // 只认可第一枚进入的触点
        this.id = event.getID(); // 获取触点id
        let now = event.getLocation(); // 当前对象
        this.lastX = now.x;
        this.lastY = now.y;
    },
    TouchOff() { // 松开
        // 参数归零
        this.id = -1;
    },
    TouchMove(event) { // 移动
        if (this.id != event.getID()) return; // 只认可第一枚进入的触点

        this.ctrl(event);
    },

    ctrl(event) {
        let now = event.getLocation(); // 当前对象
        let dx = this.lastX - now.x;
        let dy = this.lastY - now.y;
        this.lastX = now.x;
        this.lastY = now.y;
        this.cameraCtrl.ctrlAngle += dx / 2;
        if (dy < 0 && this.cameraCtrl.height <= this.maxH) {
            this.cameraCtrl.upDownAngle -= dy * 0.04;
            this.cameraCtrl.height -= dy * 0.5;
            this.cameraCtrl.hL -= dy * 0.004;
        } else if (dy > 0 && this.cameraCtrl.height >= this.minH) {
            this.cameraCtrl.upDownAngle -= dy * 0.04;
            this.cameraCtrl.height -= dy * 0.5;
            this.cameraCtrl.hL -= dy * 0.004;
        }


        // cc.log(this.cameraCtrl.height);
    },
});
