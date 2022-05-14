// 转向按钮控制器

var ship = require("ShipCtrl");

cc.Class({
    extends: cc.Component,

    properties: {
        ship: { type: ship, default: null, displayName: "要控制的船的节点" },
        arrowOffOpacity: { type: cc.Integer, default: 30, displayName: "箭头待机透明度，0~255" },
        arrowOnOpacity: { type: cc.Integer, default: 150, displayName: "箭头触发透明度" },
        blockOnOpacity: { type: cc.Integer, default: 30, displayName: "白块触发透明度" },
        arrow_L: { type: cc.Node, default: null, displayName: "左转箭头" },
        arrow_R: { type: cc.Node, default: null, displayName: "右转箭头" },
        block_L: { type: cc.Node, default: null, displayName: "左白块儿" },
        block_R: { type: cc.Node, default: null, displayName: "右白块儿" },
        block_R: { type: cc.Node, default: null, displayName: "右白块儿" },
        turnMeter: { type: cc.Node, default: null, displayName: "转向仪表盘主节点" },
        wheel: { type: cc.Node, default: null, displayName: "舵盘" },
        maxWheel: { type: cc.Float, default: 180, displayName: "舵盘最大角度" },
    },

    // LIFE-CYCLE CALLBACKS:

    load(p) {
        if (p != null)
            this.ship = p;
        // 注册本节点按下和松开事件
        this.node.on(cc.Node.EventType.TOUCH_START, this.touchOn, this); // 按下事件
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.touchMove, this); // 移动事件
        this.node.on(cc.Node.EventType.TOUCH_END, this.touchOff, this); // 松开事件
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.touchOff, this); // 取消(移出范围再松开)事件
        // 最早按下本节点的触点id。全程只认可该id的操作。空为-1
        this.id = -1;
        // 当前触发的方向。左1右2，刚松开0，长期松开-1。
        this.LR = 0;
        // 获取结点的宽度的一半，作为分界线
        this.width = this.node.getContentSize().width / 2;
        // 重置透明度
        this.arrow_L.opacity = this.arrow_R.opacity = this.arrowOffOpacity;
        this.block_L.opacity = this.block_R.opacity = 0;
        // 转向仪表盘参数
        this.turnWidth = this.turnMeter.getContentSize().width / 2;
        this.turnArrow = this.turnMeter.children[0];
        cc.log("仪表盘" + this.turnWidth + "|" + this.turnArrow.name);
        // 设置缓动组
        this.kirakira = cc.tween().to(0.2, { opacity: this.blockOnOpacity }).to(0.6, { opacity: 0 }); // 闪烁
        this.opacityGoZero = cc.tween().to(2, { opacity: 0 }); // 归于透明
        this.tween = null; // 记录当前缓动
    },
    onDestroy() {
        // 退出时取消监听
        this.node.off(cc.Node.EventType.TOUCH_START, this.touchOn, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.touchOff, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.touchOff, this);
    },

    update(dt) {
        // 设置仪表盘
        this.setTurn();
    },

    // 触摸监控
    touchOn(event) { // 按下
        if (this.id != -1) return; // 只认可第一枚进入的触点
        this.id = event.getID(); // 获取触点id
        this.ifLR(event.getLocationX()); // 传入当前触点的x值
    },
    touchOff() { // 松开
        // 参数归零
        this.id = -1;
        this.LR = 0;
        this.arrow_L.opacity = this.arrow_R.opacity = this.arrowOffOpacity;
        // 让船归零
        this.ship.setLR(0);
    },
    touchMove(event) { // 移动
        if (this.id != event.getID()) return; // 只认可第一枚进入的触点
        this.ifLR(event.getLocationX());
    },

    // 判断当前触点在左还是右
    ifLR(x) {
        if (x < this.width) {
            if (this.LR != 1) { // 若本帧刚按到左
                this.LR = 1;
                // 通知船
                this.ship.setLR(1);
                // 箭头透明度
                this.arrow_L.opacity = this.arrowOnOpacity; // 按下透明度提升
                this.arrow_R.opacity = this.arrowOffOpacity; // 反方向透明度提升
                // 让块闪烁一下
                this.kirakira.clone(this.block_L).start(); // 克隆一个闪烁的缓动，让块执行
            }
        }
        else {
            if (this.LR != 2) { // 若本帧刚按到左
                this.LR = 2;
                this.ship.setLR(2);
                this.arrow_L.opacity = this.arrowOffOpacity;
                this.arrow_R.opacity = this.arrowOnOpacity;
                this.kirakira.clone(this.block_R).start();
            }
        }
    },

    // 控制方向滑块指示
    setTurn() {
        let rr = this.ship.engine.rudderRation;

        if (this.LR == 0 && rr == 0) { // 没有触控，且已经自然归零
            this.LR = -1;
            // 参数归零
            this.turnArrow.x = this.wheel.angle = 0;
            // 透明度归零
            this.tween = this.opacityGoZero.clone(this.turnMeter).start();
        } else if (this.LR != -1) {
            // 滑块要反一下，滑块往右为正，但船左转为正。
            this.turnArrow.x = -this.turnWidth * rr;
            // 舵盘
            this.wheel.angle = this.maxWheel * rr;
            // 透明度
            this.tween.stop();
            this.turnMeter.opacity = 100;
        }
    },
});
