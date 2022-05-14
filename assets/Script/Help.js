// 新手引导

var ai = require("AI");

cc.Class({
    extends: cc.Component,

    properties: {
        ai: { type: ai, default: [], displayName: "场上AI" },
    },

    addShip(s) {
        // 添加一条船
        let n = this.ai.length;
        this.ai[n] = s;
    },


    load() {
        for (let i = 1; i < this.node.children.length; i++)
            this.node.children[i].active = false;
        this.node.children[this.node.children.length - 2].active = true;
    },

    goNew() { // 下一条提示
        if (this.node.children.length > 1) {
            this.node.children[1].active = true;
            this.node.children[0].destroy();
        }
    },

    goStart() { // 开始游戏
        for (let i = 0; i < this.ai.length; i++) {
            this.ai[i].setOpen();
        }
        this.node.destroy();
    },
});
