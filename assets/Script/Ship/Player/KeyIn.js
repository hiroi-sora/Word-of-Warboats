// 简单用于测试的键盘输入

var speedSlider = require("SpeedSliderCtrl");
var turnButton = require("TurnButtonCtrl");
var aimFire = require("AimFire");

cc.Class({
    extends: cc.Component,

    properties: {
        speedSlider: { type: speedSlider, default: null, displayName: "油门滑杆节点" },
        turnButton: { type: turnButton, default: null, displayName: "方向按钮节点" },
        aimFire: { type: aimFire, default: null, displayName: "火控节点" },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        // cc.macro.SHOW_MESH_WIREFRAME = true; // 显示网格
        // 初始化键盘监听
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDn, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        this.LR = false;
        this.W = false;
        this.S = false;
        this.A = false;
        this.D = false;
    },
    onDestroy() {
        // 退出时取消键盘输入监听
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDn, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    },

    onKeyDn(event) { // 键盘按下
        // cc.log("按下" + event.keyCode);
        switch (event.keyCode) {
            case cc.macro.KEY.w:
            case cc.macro.KEY.up:
                this.goW();
                break;
            case cc.macro.KEY.s:
            case cc.macro.KEY.down:
                this.goS();
                break;
            case cc.macro.KEY.d:
            case cc.macro.KEY.right:
                this.D = true;
                break;
            case cc.macro.KEY.a:
            case cc.macro.KEY.left:
                this.A = true;
                break;
            case cc.macro.KEY.space:
                this.aimFire.touchOn();
                break;
            case 49: // 数字键1
                this.aimFire.changeWeapon(0, 0);
                break;
            case 50: // 数字键2
                this.aimFire.changeWeapon(0, 1);
                break;
            case 48: // 数字键0
                this.aimFire.changeWeapon(0, 99);
                break;
        }
    },
    onKeyUp(event) { // 键盘抬起
        switch (event.keyCode) {
            case cc.macro.KEY.d:
            case cc.macro.KEY.right:
                this.D = false;
                break;
            case cc.macro.KEY.a:
            case cc.macro.KEY.left:
                this.A = false;
                break;
            case cc.macro.KEY.space:
                this.aimFire.touchOff();
                break;
        }
    },

    goW() { // 控制油门滑杆向 ↑ 一格
        let s = this.speedSlider.slider.progress;
        if (s >= 0.8) this.speedSlider.slider.progress = 1;
        else if (s >= 0.6) this.speedSlider.slider.progress = 0.8;
        else if (s >= 0.4) this.speedSlider.slider.progress = 0.6;
        else if (s >= 0.2) this.speedSlider.slider.progress = 0.4;
        else this.speedSlider.slider.progress = 0.2;
        this.speedSlider.input();
    },
    goS() { // 控制油门滑杆向 ↓ 一格
        let s = this.speedSlider.slider.progress;
        if (s <= 0.2) this.speedSlider.slider.progress = 0;
        else if (s <= 0.4) this.speedSlider.slider.progress = 0.2;
        else if (s <= 0.6) this.speedSlider.slider.progress = 0.4;
        else if (s <= 0.8) this.speedSlider.slider.progress = 0.6;
        else this.speedSlider.slider.progress = 0.8;
        this.speedSlider.input();
    },

    update(dt) {
        if (this.A && !this.D) {
            this.turnButton.ifLR(1);
            this.LR = true;
        } else if (this.D && !this.A) {
            this.turnButton.ifLR(1000);
            this.LR = true;
        } else if (this.LR) {
            this.turnButton.touchOff();
            this.LR = false;
        }
    },
});
