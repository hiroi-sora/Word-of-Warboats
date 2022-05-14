// 控制水面

cc.Class({
    extends: cc.Component,

    properties: {
        target: { type: cc.Node, default: null, displayName: "目标节点" },
        wn: { type: cc.Node, default: [], displayName: "水面节点,0~8" },
        side: { type: cc.Float, default: 10000, displayName: "边长" },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        // 用二维数组来储存3*3的水面块
        this.waterNode = [];
        for (let i = 0; i < 3; i++) {
            this.waterNode[i] = [];
            for (let ii = 0; ii < 3; ii++) {
                this.waterNode[i][ii] = this.wn[i * 3 + ii];
            }
        }
        // 记录上下左右边界。出界时刷新地图
        let z = cc.v2(this.waterNode[1][1].x, this.waterNode[1][1].y);
        let s = this.side * 0.5;
        this.bW = z.y + s;
        this.bS = z.y - s;
        this.bA = z.y - s;
        this.bD = z.y + s;

        // for (let i = 0; i < 3; i++)
        //     for (let ii = 0; ii < 3; ii++) {
        //         cc.log("[" + i + "," + ii + "]:" + this.waterNode[i][ii].name + this.waterNode[i][ii].position);
        //     }
        // this.goW();
        // this.goW();
        // for (let i = 0; i < 3; i++)
        //     for (let ii = 0; ii < 3; ii++) {
        //         cc.log("[" + i + "," + ii + "]:" + this.waterNode[i][ii].name + this.waterNode[i][ii].position);
        //     }

    },

    start() {
    },

    update(dt) {
        let p = this.target.convertToWorldSpaceAR(cc.v2()); // 获取目标的世界坐标
        // 为了不要耗时太长，一帧只处理一个方向的移动
        if (p.y > this.bW) { this.goW(); return; }
        if (p.y < this.bS) { this.goS(); return; }
        if (p.x < this.bA) { this.goA(); return; }
        if (p.x > this.bD) { this.goD(); return; }
    },


    // 地图块的上下左右移动，将一边的三块地图调到另一边。
    goW() {
        let y = this.waterNode[2][0].y + this.side; // 新的y值是最上块的y加上边长
        let a = this.waterNode.shift(); // 将数组第一项删除并返回
        for (let i = 0; i < 3; i++)
            a[i].y = y; // 将新块所有项移动
        this.waterNode.push(a); // 添加回数组结尾
        this.bW += this.side;
        this.bS += this.side;
        // cc.log("goW" + this.bW);
    },
    goS() {
        let y = this.waterNode[0][0].y - this.side;
        let a = this.waterNode.pop();
        for (let i = 0; i < 3; i++)
            a[i].y = y;
        this.waterNode.unshift(a);
        this.bW -= this.side;
        this.bS -= this.side;
        // cc.log("goS" + this.bS);
    },
    goA() {
        let x = this.waterNode[0][0].x - this.side;
        let a;
        for (let i = 0; i < 3; i++) {
            a = this.waterNode[i].pop();
            a.x = x;
            this.waterNode[i].unshift(a);
        }
        this.bA -= this.side;
        this.bD -= this.side;
        // cc.log("goA" + this.bA);
    },
    goD() {
        let x = this.waterNode[0][2].x + this.side;
        let a;
        for (let i = 0; i < 3; i++) {
            a = this.waterNode[i].shift();
            a.x = x;
            this.waterNode[i].push(a);
        }
        this.bA += this.side;
        this.bD += this.side;
        // cc.log("goD" + this.bD);
    },
});
