// 玩家弹道指示等下层UI的控制

cc.Class({
    extends: cc.Component,

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        // 绘图
        this.father = this.node.parent;
        this.canvas = cc.Canvas.instance.node;
        this.graphics = cc.find("Canvas/Player UI").getComponent(cc.Graphics); // 获取绘图组件
    },

    start() {

    },

    // update (dt) {},
});
