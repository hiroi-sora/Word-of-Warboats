// 游戏总控制

cc.Class({
    extends: cc.Component,

    properties: {
        debugDraw: { default: true, displayName: "开启碰撞debug绘制" },
        boundingBox: { default: true, displayName: "开启碰撞组件包围盒绘制" },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        // 获取碰撞检测系统
        var manager = cc.director.getCollisionManager();
        // 开启碰撞检测系统
        manager.enabled = true;
        // 开启碰撞组件 debug 绘制
        manager.enabledDebugDraw = this.debugDraw;
        // 开启碰撞组件包围盒绘制
        manager.enabledDrawBoundingBox = this.boundingBox;

        // 开启物理系统
        var phy = cc.director.getPhysicsManager();
        phy.enabled = true;
        // 修改0重力
        phy.gravity = cc.v2();
        // 开启物理绘制
        phy.debugDrawFlags = this.debugDraw;
    },

    start() {

    },

    // update (dt) {},
});
