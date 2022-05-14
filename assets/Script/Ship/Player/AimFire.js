// 瞄准，开火

var shipCtrl = require("ShipCtrl");

cc.Class({
    extends: cc.Component,

    properties: {
        camera: { type: cc.Camera, default: null, displayName: "摄像机节点" },
        starNode: { type: cc.Node, default: null, displayName: "准星节点" },
        fireButton: { type: cc.Node, default: null, displayName: "开火按钮节点" },
        ship: { type: shipCtrl, default: null, displayName: "控制船节点" },
        test: { type: cc.Node, default: null, displayName: "测试目标节点" },
        changeButton: { type: cc.Button, default: [], displayName: "切换武器按钮" },
    },
    onDestroy() {
        // 退出时取消监听
        this.node.off(cc.Node.EventType.TOUCH_START, this.touchOn, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.touchOff, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.touchOff, this);
    },

    // LIFE-CYCLE CALLBACKS:

    load(p) {
        if (p != null)
            this.ship = p;
        this.open = true; // 本组件启用与否
        if (this.ship == null) // 检查目标船上是否有武器
            this.open = false;
        // 获取准星的世界坐标
        this.star = this.starNode.convertToWorldSpaceAR(cc.Vec2.ZERO);
        // 注册按钮按下和松开事件
        this.fireButton.on(cc.Node.EventType.TOUCH_START, this.touchOn, this); // 按下事件
        this.fireButton.on(cc.Node.EventType.TOUCH_END, this.touchOff, this); // 松开事件
        this.fireButton.on(cc.Node.EventType.TOUCH_CANCEL, this.touchOff, this); // 取消(移出范围再松开)事件
    },

    start() {
        if (this.open && this.ship.weapon.n != 0) // 检查目标船上是否有武器
            this.changeWeapon(0, 0); // 有武器，先切到火炮
        else
            this.open = false;
    },

    update(dt) {
        if (!this.open) return;
        // 获取一条射线
        let ray = this.camera.getRay(this.star);
        // t是偏移系数，在射线上按照t偏移可以得到一个z=0的点，其xy值为咱所求。
        let t = (-ray.o.z) / (ray.d.z); // t=-0(z)/d(z) 
        // 按照t偏移，得到目标点p
        let p = ray.o.add(ray.d.mul(t)); // point=o+d*t
        let v2 = cc.v2(p.x, p.y);
        // 将转换后的坐标设置给测试节点
        this.test.setPosition(v2);
        // cc.log("映射世界坐标" + p.toString());
    },


    // 触摸监控
    touchOn() { // 按下
        // cc.log("按下开火");
        this.ship.fireStart();
    },
    touchOff() { // 松开
        // cc.log("松开开火");
        this.ship.fireStop();
    },

    changeWeapon(a, i) { // 切换武器
        // cc.log("切换" + i);
        this.ship.fireChange(i);

        let nowMode = this.ship.getWeaponGroup();
        for (let i = 0; i < 3; i++) {
            this.changeButton[i].interactable = true;
        }
        if (nowMode == 99)
            this.changeButton[0].interactable = false;
        else
            this.changeButton[nowMode + 1].interactable = false;
    },
});
