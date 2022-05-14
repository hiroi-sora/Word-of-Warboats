// 武器的主控

cc.Class({
    extends: cc.Component,

    properties: {
        downNode: { type: cc.Node, default: null, displayName: "下层武器节点" },
        torpedoPrefab: { type: cc.Prefab, default: null, displayName: "鱼雷预制体" },
        shellPrefab: { type: cc.Prefab, default: null, displayName: "炮弹预制体" },
        trailPrefab: { type: cc.Prefab, default: null, displayName: "拖尾预制体" },
    },

    onLoad() {
        // 创建各个预制体的对象池
        this.torpedoPool = []; // 保存可用鱼雷的对象池

        this.torpedoPool = new cc.NodePool('B-torpedo'); // 选择B-torpedoCtrl作为事件传递的脚本
        this.shellPool = new cc.NodePool('B-shell');
        this.trailPool = new cc.NodePool();

        for (let i = 0; i < 5; i++) {
            let b1 = cc.instantiate(this.torpedoPrefab); // 创建节点
            this.torpedoPool.put(b1); // 加入对象池
            let b2 = cc.instantiate(this.shellPrefab);
            this.shellPool.put(b2);
            let b3 = cc.instantiate(this.trailPrefab);
            this.trailPool.put(b3);
        }

        cc.log("子弹管理初始化完毕，对象池" + this.trailPool.size());
    },

    torpedoFire(x, y, angle, l) { // 发射鱼雷，输入起始坐标、角度、射程
        let b;
        if (this.torpedoPool.size() > 0) { // 对象池还有存货
            b = this.torpedoPool.get(); // 从对象池中取一个物体
            // cc.log("鱼雷出");
        } else { // 没存货
            b = cc.instantiate(this.torpedoPrefab); // 创建新物体
            // cc.log("鱼雷创");
        }
        b.parent = this.downNode;
        // 轨迹加上随机数
        angle += 1 * (Math.random() - 0.5);
        b.getComponent("B-torpedo").reset(x, y, angle, l);
        // cc.log(b.name + "生成" + "(" + b.x.toFixed(0) + "," + b.y.toFixed(0) + ")" + b.angle.toFixed(0));
    },
    torpedoReturn(b) { // 回收鱼雷
        this.torpedoPool.put(b);
    },

    shellFire(x, y, angle, l, h) { // 发射炮弹，输入起始坐标、角度、射程、初始高度
        let b;
        if (this.shellPool.size() > 0) // 对象池还有存货
            b = this.shellPool.get(); // 从对象池中取一个物体
        else // 没存货
            b = cc.instantiate(this.shellPrefab); // 创建新物体
        b.parent = this.node;
        let sh = b.getComponent("B-shell");
        // 轨迹加上随机数
        angle += 5 * (Math.random() - 0.5);
        sh.reset(x, y, angle, l, h);
        // cc.log("生成炮弹" + "(" + b.x.toFixed(0) + "," + b.y.toFixed(0) + ")" + b.angle.toFixed(0));

        sh.trail = this.trailFire(b); // 生成拖尾节点，并将返回的节点传入给炮弹组件
    },
    shellReturn(b) { // 回收炮弹
        this.shellPool.put(b);
    },

    trailFire(sh) { // 生成拖尾。要跟踪的传入炮弹节点。
        let b;
        if (this.trailPool.size() > 0) // 对象池还有存货
            b = this.trailPool.get(); // 从对象池中取一个物体
        else // 没存货
            b = cc.instantiate(this.trailPrefab); // 创建新物体
        b.parent = this.node;
        let ef = b.getComponent("TrailEffect_js");
        ef.autoPlay(sh); // 给拖尾组件传入炮弹节点
        return ef; // 返回拖尾组件
    },
    trailReturn(b) { // 回收拖尾
        // cc.log("拖尾" + b.name + "回收");
        this.trailPool.put(b);
    },

});
