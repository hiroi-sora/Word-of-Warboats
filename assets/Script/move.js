// 简单的移动脚本

cc.Class({
    extends: cc.Component,

    properties: {
        speed: { default: new cc.Vec3, displayName: "速度" },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    // start () {

    // },

    update(dt) {
        this.node.x += dt * this.speed.x;
        this.node.y += dt * this.speed.y;
        this.node.z += dt * this.speed.z;
    },
});
