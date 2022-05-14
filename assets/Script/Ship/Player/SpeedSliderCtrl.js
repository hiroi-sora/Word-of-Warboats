// 速度滑块控制器

var ship = require("ShipCtrl");
cc.Class({
    extends: cc.Component,

    properties: {
        speedLable: { type: cc.Node, default: null, displayName: "标签节点" },
        button: { type: cc.Node, default: null, displayName: "按钮节点" },
        ship: { type: ship, default: null, displayName: "要控制的船的节点" },
    },

    // LIFE-CYCLE CALLBACKS:

    load(p) {
        if (p != null)
            this.ship = p;
        // 滑杆组件
        this.slider = this.node.getComponent(cc.Slider);
        // Lable子节点
        this.speedText = this.speedLable.getComponentInChildren(cc.Label); // 查找标签的子节点的Lable组件
        this.speedLableHeight = this.node.getContentSize().height * 0.8; // 速度标签的最大高度
        this.speedLableZeroY = this.speedLableHeight * -3 / 8; // 速度标签的基准y值
        // 注册按钮松开事件
        this.button.on(cc.Node.EventType.TOUCH_END, this.buttonOff, this); // 按下后松开后事件
        this.button.on(cc.Node.EventType.TOUCH_CANCEL, this.buttonOff, this); // 按下取消(移出范围再松开)事件
        cc.log("油门控制杆初始化完毕");
    },

    onDestroy() {
        // 退出时取消监听
        this.button.off(cc.Node.EventType.TOUCH_END, this.buttonOff, this);
        this.button.off(cc.Node.EventType.TOUCH_CANCEL, this.buttonOff, this);
    },

    start() {
        // this.setSpeedLable(0, 0);
    },

    update(dt) {
        // 根据船速设置标签
        this.setSpeedLable(this.ship.engine.speedRation, this.ship.engine.speed);
    },

    // 滑杆输入
    input() {
        let s = this.slider.progress;
        s = s * 1.25 - 0.25; // 将滑块的0~1转为-0.25~1
        this.ship.setSpeed(s);
    },

    // 按钮离开
    buttonOff() {
        // 吸附
        let s = this.slider.progress;
        if (s > 0.9) s = 1;
        else if (s > 0.7) s = 0.8;
        else if (s > 0.5) s = 0.6;
        else if (s > 0.3) s = 0.4;
        else if (s > 0.1) s = 0.2;
        else s = 0;
        this.slider.progress = s;
        this.ship.setSpeed(s * 1.25 - 0.25);
        cc.log("按钮离开");
    },

    // 设置速度标签
    setSpeedLable(s, sp) { // 输入速度相对值(-0.25~1)，速度绝对值
        this.speedLable.y = s * this.speedLableHeight + this.speedLableZeroY;
        this.speedText.string = sp.toFixed(1) + "kts";
    },
});
