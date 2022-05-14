// 摇杆

cc.Class({
    extends: cc.Component,

    properties: {
    },


    onLoad() {
        // 获取父节点。摇杆被父节点限制。
        this.father = this.node.parent;
        this.graphics = this.father.getComponent(cc.Graphics); // 获取绘图组件
        let ts = this.node.getContentSize(); // 获取此节点宽高
        this.drowWidth = ts.width / 2; // 绘制三角形的底边宽度为本节点宽度的一半
        let fs = this.father.getContentSize(); // 获取父节点宽高
        this.max = fs.width / 2; // 最远能移动的距离为父节点宽度一半
        this.ang = 0;
        this.l = 0;
        // 摇杆与相机角度相关
        this.camera = cc.find("Canvas/Camera Move");//.getComponent("CameraCtrl"); // 找到相机组件
        // 初始化监听
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchDn, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        this.nowId = -1; // 当前id
        // 初始位置
        this.oldV2 = this.node.position;
        // 获取玩家组件
        this.player = cc.find("Canvas/Player");
        this.playerCtrl = this.player.getComponent("ShipCtrl");
        // debug
        this.txt = cc.find("Canvas/UI/UI-debug").getComponent(cc.Label);
    },

    ccprint() {
        this.txt.string =
            "本角度" + this.ang.toFixed(2) + "\n船角度" + this.player.angle.toFixed(2)
            + "\n摄像机" + this.camera.angle.toFixed(2);
    },

    onDestroy() {
        // 退出时取消监听
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchDn, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    },

    onTouchDn(event) { // 触摸按下
        if (this.nowId != -1) return;
        this.nowId = event.getID();
        this.playerCtrl.setReady1(); // 通知玩家准备瞄准
        // cc.log("按下" + this.nowId);
    },

    onTouchMove(event) { // 触摸滑动
        if (this.nowId != event.getID()) return;
        // 求角度
        let touchV2 = this.father.convertToNodeSpaceAR(event.getLocation()); // 触点坐标
        let rightV2 = cc.v2(0, this.max);    // 水平向右的对比向量，以最大距离为单位
        let radian = touchV2.signAngle(rightV2);    // 触点坐标的弧度
        this.l = touchV2.mag(); // 求向量的长度平方。求长度是mag()，平方magSqr。
        // 图标移动
        if (this.l >= this.max)
            touchV2 = rightV2.rotate(-radian);
        this.node.position = touchV2;
        // 绘制三角区
        let thisV2 = cc.v2(this.node.x, this.node.y); // 本节点向量
        let sv1 = thisV2.rotate(0.2); // 本节点向量转个角度
        let sv2 = thisV2.rotate(-0.2);
        this.graphics.clear();
        this.graphics.moveTo(0, 0);
        this.graphics.lineTo(sv1.x, sv1.y);
        this.graphics.lineTo(sv2.x, sv2.y);
        this.graphics.fill(); // 填充
        this.ang = -cc.misc.radiansToDegrees(radian);    // 将弧度转换为角度，

        // 设置摄像机
        // this.camera.setXY(touchV2.x, touchV2.y);
    },

    onTouchEnd(event) { // 触摸离开
        this.nowId = -1;
        this.node.position = this.oldV2;
        this.graphics.clear();
        this.playerCtrl.setFire1();
        // cc.log("摇杆离开");
        // 归零摄像机
        // this.camera.setXY(0, 0);
    },

    update(dt) {
        // 通知玩家
        if (this.nowId != -1) {
            let newAng = this.ang - this.player.angle + this.camera.angle + 90 // 加上玩家和相机角度
            this.playerCtrl.setAngle1(newAng, this.l / this.max);
        }

        this.ccprint();
    },
});
