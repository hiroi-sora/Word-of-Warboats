// 别的船的ui显示

// 一个UI组
var ui = cc.Class({
    name: "ui",
    properties: {
        node: { type: cc.Node, default: null, visible: false },
        hp: { type: cc.Lable, default: null, visible: false }, // 血量显示
        luck: { type: cc.Node, default: null, visible: false }, // 血量显示
    },
})

// 一条船
var shipCtrl = require("ShipCtrl");
var ship = cc.Class({
    name: "ship",
    properties: {
        node: { type: cc.Node, default: null, displayName: "船节点" },
        topNode: { type: cc.Node, default: null, visible: false }, // 顶上节点
        ctrl: { type: shipCtrl, default: null, visible: false }, // 船的控制器
        ui: { type: ui, default: null, displayName: "UI" },
    },
})


cc.Class({
    extends: cc.Component,

    properties: {
        ship: { type: ship, default: [], displayName: "目标船" },
        cameraNode: { type: cc.Node, default: null, displayName: "3d摄像机节点" },
        uiPrefab: { type: cc.Prefab, default: null, displayName: "敌人UI预制体" },
        player: { type: cc.Node, default: null, displayName: "玩家节点" },
        aimNode: { type: cc.Node, default: null, displayName: "瞄准点" },
    },

    addShip(s) { // 添加一条船
        let n = this.ship.length;
        this.ship[n] = new ship;
        this.ship[n].ui = new ui;
        this.ship[n].node = s;
    },

    load(p) {
        if (p != null)
            this.player = p;
        this.camera3d = this.cameraNode.getComponent(cc.Camera);
        this.playerCtrl = this.player.getComponent(shipCtrl);
        // 初始化船
        this.shipN = this.ship.length;
        cc.log("UI加载" + this.shipN);
        for (let i = 0; i < this.shipN; i++) {
            // 初始化船相关属性
            let c = this.ship[i].node.getComponent(shipCtrl); // 获取控制器组件
            if (c === null) { cc.warn("UI未获得敌" + this.ship[i].node.name + "的控制器组件！"); continue; }
            this.ship[i].ctrl = c;
            let t = this.ship[i].node.getChildByName("TopNode"); // 获取顶节点
            if (t === null) { cc.warn("UI未获得敌" + this.ship[i].node.name + "的顶上节点！"); continue; }
            this.ship[i].topNode = t;
            // 创建并初始化UI
            let u = cc.instantiate(this.uiPrefab); // 创建
            u.parent = this.node;
            this.ship[i].ui.node = u; // 将创建的节点绑定到ship对象中
            this.ship[i].ui.hp = u.getChildByName("HP").getComponent(cc.Label);
            this.ship[i].ui.hp.string = this.ship[i].ctrl.life.hp + "/" + this.ship[i].ctrl.life.maxHP;
            this.ship[i].ui.node.on(cc.Node.EventType.TOUCH_END, this.touchOff, this); // 注册UI的松开事件
            this.ship[i].ui.node.luck = u.getChildByName("Luck");
            this.ship[i].ui.node.name = i.toString(); // 改名
            u.getChildByName("Name").getComponent(cc.Label).string =
                "[" + this.ship[i].ctrl.id.type + "] " + this.ship[i].ctrl.id.name;
        }
        this.canvasNode = cc.Canvas.instance.node; // 画布节点
    },

    start() {

    },



    lateUpdate() {
        for (let i = 0; i < this.shipN; i++) {
            // 计算角度，是否在正半球
            let v = this.cameraNode.convertToNodeSpaceAR(this.ship[i].node.position); // 将目标船世界坐标转为摄像机节点坐标
            if (v.y < 0) { // 出界，不显示
                this.ship[i].ui.node.x = 10000;
                continue;
            }
            // 更新位置
            this.setScreenPoi(this.ship[i].topNode, this.ship[i].ui.node);
            // 更新血量
            if (this.ship[i].ctrl.life.hp <= 0) {
                // 删除对象
                this.ship[i].ui.node.destroy();
                this.ship[i].node.destroy();
                this.ship.splice(i, 1);
                this.shipN--;
                this.touchOff(0, 99);
                return;
            }
            this.ship[i].ui.hp.string = this.ship[i].ctrl.life.hp + "/" + this.ship[i].ctrl.life.maxHP;
        }
    },
    setScreenPoi(target, ui) { // 设置屏幕坐标，输入目标节点target和UI节点ui
        var poi = target.parent.convertToWorldSpaceAR(target.position); // 获取目标的世界坐标
        var inScreenPoi = new cc.Vec2();
        // 一个神奇的函数 worldToScreen，将3d坐标poi转换为屏幕坐标inScreenPoi
        this.camera3d._camera.worldToScreen(inScreenPoi, poi, this.canvasNode.width, this.canvasNode.height);
        ui.setPosition(this.canvasNode.convertToNodeSpaceAR(inScreenPoi)); // 将屏幕坐标转换为相对坐标
        // 屏幕坐标=cocos坐标 *cc.view.getScale()/cc.view.getDevicePixelRatio()
    },

    touchOff(event, a) {
        if (a == 99) { // 解除锁定
            for (let i = 0; i < this.shipN; i++)
                this.ship[i].ui.node.luck.active = false;
            this.playerCtrl.resetTarget(this.aimNode);
            return;
        }
        let n = event.target.name;
        if (this.ship[n].ui.node.luck.active == true) {
            this.ship[n].ui.node.luck.active = false;
            this.playerCtrl.resetTarget(this.aimNode);
            return;
        }
        for (let i = 0; i < this.shipN; i++)
            this.ship[i].ui.node.luck.active = false;
        this.ship[n].ui.node.luck.active = true;
        this.playerCtrl.resetTarget(this.ship[n].node);
    },
});