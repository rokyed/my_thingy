
var cms = new CMS();
var canvas;
var timer;

window.onload = function () {

cms.addBlueprint("Canvas",{
    config: {
        cvsElement: null,
        contextElem: null,
        cvsResolution: {
            width: 100,
            height: 100
        },
        cvsSize: {
            width: 600,
            height: 600
        }

    },
    init: function () {
        this.set("cvsElement", document.createElement("canvas"));
        var cvs = this.get("cvsElement"),
            cvsRes = this.get("cvsResolution"),
            cvsSize = this.get("cvsSize");

        cvs.width = cvsRes.width;
        cvs.height = cvsRes.height;
        cvs.setAttribute("style","width:"+cvsSize.width+";height:"+cvsSize.height+";");

        document.body.appendChild(cvs);

        this.set("contextElem",cvs.getContext("2d"));
    },
    context: function () {
        return this.get("contextElem");
    },
    clear: function () {
        var ctx = this.get("contextElem"),
            res = this.get("cvsResolution");

        ctx.clearRect(0,0,res.width,res.height);
    },
    drawPoint: function(x, y, color) {
        var ctx  = this.get("contextElem");
        ctx.fillStyle = "#" + color;
        ctx.fillRect(x,y,1,1);
    },
    draw: function(point) {
        var ctx  = this.get("contextElem");
        ctx.fillStyle = "#" + point.color;
        ctx.fillRect(point.x,point.y,1,1);
    },
    getAreaEdges: function() {
        var res = this.get("cvsResolution");
        return {
            up: 0,
            down: res.height,
            left: 0,
            right: res.width
        }
    }

});



cms.addBlueprint("Point",{
    config: {
        position: {
            x: 0,
            y: 0
        },
        proxy: {
            up: false,
            down: false,
            left: false,
            right: false
        },
        color: "f0f",
        maxLimit: 400

    },
    getPoint: function () {
        var pos =  this.get("position"),
            color = this.get("color");

        return {
            x: pos.x,
            y: pos.y,
            color: "fff"//Math.floor(Math.random() * 16777215).toString(16)
        }
    },
    die: function() {
      delete cms.instances[this.$uniqueId];
    },
    setProxy: function(str) {
        var prox = this.get("proxy");

        if (str != "")
            prox[str] = true;

        this.set("proxy",prox);
    },
    lifeGame: function() {
        var pos = this.get("position"),
            prox = this.get("proxy"),
            ctr = 0;

        for (var p in prox) {
            if(prox[p])
                ctr++;
        }
        if( ctr == 2 && cms.countItemsIn(cms.instances) < this.get("maxLimit")) {
            var h = 0;
            var v = 0;

            if(!prox.up)
                v =1;
            if(!prox.down)
                v = -1;
            if(!prox.left)
                h = -1;
            if(!prox.right)
                h = 1

            cms.makeInstance({
                type:"Point",
                config:{
                    position: {
                        x: pos.x + h,
                        y: pos.y + v
                    }
                }
            });
        }

        if(ctr == 0 || ctr >= 3) {
            this.die();
        }
    },
    move: function(area) {
        this.lifeGame();

        var choice = -1,
            counter = 0,
            pos = this.get("position"),
            proximity = this.get("proxy");

        do {
            if (counter > 10) {

                choice = -1;
                break;
            }

            choice = Math.floor(Math.random() * 4);

            if (!proximity.up && choice == 0 && pos.y > area.up) {

                break;
            }

            if (!proximity.down && choice == 1 && pos.y < area.down) {

                break
            }

            if (!proximity.left && choice == 2 && pos.x > area.left) {

                break;
            }

            if (!proximity.right && choice == 3 && pos.x < area.right) {

                break;
            }

            counter++;

        } while (true);

        switch (choice) {
            case 0:
                pos.y -=1;
                break;
            case 1:
                pos.y +=1;
                break;
            case 2:
                pos.x -=1;
                break;
            case 3:
                pos.x +=1;
                break;
            default:
                break;

        };
        this.set("position",pos);
        this.set("proxy", {up:false,left:false,right:false,down:false});



    }




});

canvas = cms.getInstance(cms.makeInstance({
    type:"Canvas"
},"init"));
for ( var u = 0 ; u < 10; u++)
    for ( var i = 0 ; i < 10; i++)
        cms.makeInstance({
            type:"Point",
            config:{
                position: {
                    x: i,
                    y: u
                }
            }
        });

timer = window.setInterval(function() {window.runningBabe();},100);

}

function runningBabe() {

    var objList = cms.getAllInstancesOfTypeAsObj("Point"),
        area = canvas.getAreaEdges(),
        cnt = cms.countItemsIn(cms.getAllInstancesOfTypeAsObj("Point"));

    canvas.clear();
    console.log(cnt);

    for (obj in objList){
        var p1 = objList[obj].getPoint();
        var prox1 = objList[obj].get("proxy");
        for(obj2 in objList){
            var p2 = objList[obj2].getPoint();
            var prox2 = objList[obj2].get("proxy");

            if (p1.x + 1 == p2.x && p1.y == p2.y && !prox1.right && !prox2.right)
                objList[obj].setProxy("right");

            if (p1.x - 1 == p2.x && p1.y == p2.y && !prox1.left && !prox2.left)
                objList[obj].setProxy("left");

            if (p1.x == p2.x && p1.y + 1 == p2.y && !prox1.down && !prox2.down)
                objList[obj].setProxy("down");

            if (p1.x == p2.x && p1.y - 1 == p2.y && !prox1.up && !prox2.up)
                objList[obj].setProxy("up");

        }

        objList[obj].move(area);
        canvas.draw(objList[obj].getPoint());

    }

    if (cnt <= 0)
        window.clearInterval(timer);


}