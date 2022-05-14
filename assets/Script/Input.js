// 监控输入

cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad() {
        // 初始化监听
        cc.log("输入初始化开始");
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDn, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchDn, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        this.player = cc.find("Canvas/Player").getComponent("ShipCtrl"); // 找到船
        this.舵盘 = cc.find("Canvas/UI/舵盘");
        this.camera = cc.find("Canvas/Camera Move/Player Camera").getComponent(cc.Camera);
        this.sfTxt = cc.find("Canvas/UI/缩放杆/txt2").getComponent(cc.Label);
        this.water = cc.find("Canvas/Water");
        // this.txt = this.node.getComponentInChildren(cc.Label); // 查找子节点中第一个符合的【组件】
        let size = this.node.getContentSize(); // 节点大小
        this.w = size.width / 2;
        this.h = size.height / 2;
        this.sf = 1;
        // 记录触摸开始时初始值
        this.oldSpeed = 0;
        this.old舵角 = 0;
        // 横、纵向触摸的手指id，-1代表无
        this.touchXid = -1;
        this.touchYid = -1;
        // 键盘操作
        this.W = false;
        this.S = false;
        this.A = false;
        this.D = false;
        cc.log("输入初始化完毕" + size.width);
    },
    onDestroy() {
        // 退出时取消监听
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDn, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchDn, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    },

    onSf(slider) { // 缩放
        this.sf = (0.5 + slider.progress) * 1.9;
        let x = slider.progress;
        this.sf = 2.4 * x * x - 0.4 * x + 0.1;
        this.camera.zoomRatio = this.sf;
        this.sfTxt.string = this.sf.toFixed(2);
        if (this.sf < 0.75) {
            this.water.opacity = this.sf < 0.25 ? 0 : (this.sf - 0.25) * 510; // 改变水面透明度
        }

        // cc.log("缩放" + this.sf + slider.progress);
    },


    onTouchDn(event) { // 触摸按下
        // 记录初始数值
        if (this.touchXid == -1)
            this.oldSpeed = this.player.ctrlSpeed;
        if (this.touchYid == -1)
            this.old舵角 = this.player.ctrl舵角;
    },

    onTouchMove(event) { // 触摸滑动
        let id = event.getID();
        let now = event.getLocation(); // 当前对象
        let old = event.getStartLocation(); // 初始对象
        let x = now.x - old.x;
        let y = now.y - old.y;
        // this.ccprint();
        if (this.touchXid == id) { // 横向操作
            this.舵盘.opacity = 150;
            this.player.ctrl舵角 = this.old舵角 - x / this.w;
            if (this.player.ctrl舵角 > 1) this.player.ctrl舵角 = 1;
            else if (this.player.ctrl舵角 < -1) this.player.ctrl舵角 = -1;
            if (Math.abs(this.player.ctrl舵角) < 0.05) this.player.ctrl舵角 = 0;
        } else if (this.touchYid == id) { // 纵向操作
            this.player.ctrlSpeed = this.oldSpeed + y / this.h;
            if (this.player.ctrlSpeed > 1) this.player.ctrlSpeed = 1;
            else if (this.player.ctrlSpeed < -0.25) this.player.ctrlSpeed = -0.25;
            if (Math.abs(this.player.ctrlSpeed) < 0.05) this.player.ctrlSpeed = 0;
        } else if (this.touchXid == -1 && Math.abs(x) > Math.abs(y) && Math.abs(x) > 1) {
            this.touchXid = id; // 将横向操作登录为此触点id
        } else if (this.touchYid == -1 && Math.abs(y) > 1) {
            this.touchYid = id; // 纵向操作登录为此触点id
        }
        // cc.log('Touch move');
    },

    onTouchEnd(event) { // 触摸离开
        this.舵盘.opacity = 50;
        // 取消操作与id的绑定
        let id = event.getID();
        if (this.touchXid == id) this.touchXid = -1;
        else if (this.touchYid == id) this.touchYid = -1;
        // this.ccprint();
    },

    ccprint() {
        this.txt.string = "触点:" + this.touchXid + "|" + this.touchYid + "|"
            + "\n控制速度" + this.player.ctrlSpeed.toFixed(2) + "方向" + this.player.ctrl舵角.toFixed(2);
    },

    onKeyDn(event) { // 键盘按下
        // cc.log("收到键盘");
        switch (event.keyCode) {
            case cc.macro.KEY.w:
            case cc.macro.KEY.up:
                this.W = true;
                break;
            case cc.macro.KEY.s:
            case cc.macro.KEY.down:
                this.S = true;
                break;
            case cc.macro.KEY.a:
            case cc.macro.KEY.left:
                this.A = true;
                break;
            case cc.macro.KEY.d:
            case cc.macro.KEY.right:
                this.D = true;
                break;
        }
    },
    onKeyUp(event) { // 键盘抬起
        switch (event.keyCode) {
            case cc.macro.KEY.w:
            case cc.macro.KEY.up:
                this.W = false;
                break;
            case cc.macro.KEY.s:
            case cc.macro.KEY.down:
                this.S = false;
                break;
            case cc.macro.KEY.a:
            case cc.macro.KEY.left:
                this.A = false;
                break;
            case cc.macro.KEY.d:
            case cc.macro.KEY.right:
                this.D = false;
                break;
        }
    },

    update(dt) {
        if (this.A || this.D) {
            if (this.A) this.player.ctrl舵角 += 1 * dt;
            else if (this.D) this.player.ctrl舵角 -= 1 * dt;
            if (this.player.ctrl舵角 > 1) this.player.ctrl舵角 = 1;
            else if (this.player.ctrl舵角 < -1) this.player.ctrl舵角 = -1;
        }
        else if (Math.abs(this.player.ctrl舵角) < 0.05) this.player.ctrl舵角 = 0;
        if (this.W || this.S) {
            if (this.W) this.player.ctrlSpeed += 1 * dt;
            else if (this.S) this.player.ctrlSpeed -= 1 * dt;
            if (this.player.ctrlSpeed > 1) this.player.ctrlSpeed = 1;
            else if (this.player.ctrlSpeed < -0.25) this.player.ctrlSpeed = -0.25;
        }
        else if (Math.abs(this.player.ctrlSpeed) < 0.05) this.player.ctrlSpeed = 0;
    },
});
