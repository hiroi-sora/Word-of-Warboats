// UI控制

cc.Class({
    extends: cc.Component,

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        // 找到各个节点
        let T1 = cc.find("Canvas/UI/UI-1/T1");
        let T11 = cc.find("Canvas/UI/UI-1/T1-1");
        let T2 = cc.find("Canvas/UI/UI-1/T2");
        let T21 = cc.find("Canvas/UI/UI-1/T2-1");
        this.n1 = cc.find("Canvas/UI/UI-1/1");
        this.n2 = cc.find("Canvas/UI/UI-1/2");
        this.n3 = cc.find("Canvas/UI/UI-1/3");
        this.n4 = cc.find("Canvas/UI/UI-1/4");
        this.舵盘 = cc.find("Canvas/UI/舵盘");
        this.txtXY = cc.find("Canvas/UI/UI-1/txtXY").getComponent(cc.Label);
        this.txt3 = cc.find("Canvas/UI/UI-1/3/txt3").getComponent(cc.Label);
        this.txt4 = cc.find("Canvas/UI/UI-1/4/txt4").getComponent(cc.Label);
        // this.cdTxt = cc.find("Canvas/UI/UI-weapon/鱼雷").getComponent(cc.Label);
        this.player = cc.find("Canvas/Player");
        this.playerCtrl = this.player.getComponent("ShipCtrl");
        this.t1 = T1.position;
        this.l1 = T11.y - T1.y;
        this.m1 = this.playerCtrl.maxSpeed;
        this.t2 = T2.position;
        this.l2 = T21.x - T2.x;
        this.m2 = this.playerCtrl.max舵角;
        this.max舵盘 = 370;
        cc.log("T1(" + this.t1.x + "," + this.t1.y + "),l:" + this.l1);
        cc.log("T2(" + this.t2.x + "," + this.t2.y + "),l:" + this.l2);
    },

    // start() {
    //     this.txtXY.string = ();
    //     this.txt3.string = 3;
    //     this.txt4.string = 4;
    // },

    update(dt) {
        this.txtXY.string = "(" + this.player.x.toFixed(2) + "," + this.player.y.toFixed(2) + ")";
        this.txt3.string = this.playerCtrl.speed.toFixed(1); // 速度文字
        this.txt4.string = this.playerCtrl.舵角.toFixed(2); // 舵角文字
        this.n1.y = this.t1.y + this.l1 * (this.playerCtrl.ctrlSpeed);
        this.n2.x = this.t2.x - this.l2 * (this.playerCtrl.ctrl舵角);
        this.n3.y = this.t1.y + this.l1 * (this.playerCtrl.speed / this.m1);
        this.n4.x = this.t2.x - this.l2 * (this.playerCtrl.舵角 / this.m2);
        this.舵盘.angle = this.max舵盘 * (this.playerCtrl.舵角 / this.m2);
    },
});
