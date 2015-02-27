
// ---------------------------declaration of class management system-----------------------------------

var cms = new CMS();


cms.addBlueprint("ScreenElement",{
    config: {
        elementType: "",
        style: "",
        id: "",
        rect: {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        },
        uncompStyle: {
            position:"absolute",
            border:"solid 1px red"
        },
        domElement: null

    },
    initialize: function() {
        this.compileStyle();
        this.set("domElement", document.createElement(this.get("elementType")));
        this.updateDom();
        document.body.appendChild(this.get("domElement"));
    },
    resize: function(x, y, shallUpdate) {
        var rect = this.get("rect");
        rect.width = x;
        rect.height = y;
        this.set("rect",rect);

        if(shallUpdate) this.updateDom();
    },
    position: function(x, y,shallUpdate) {
        var rect = this.get("rect");
        rect.x = x;
        rect.y = y;
        this.set("rect",rect);

        if(shallUpdate) this.updateDom();
    },
    getBounds: function () {
        return this.get("rect");
    },
    rectSetup: function(x, y, width, height,shallUpdate) {

        if(shallUpdate) this.updateDom();
    },
    updateDom: function () {
        var dElem = this.get("domElement"),
            rect = this.get("rect"),
            compiledStyle = "";
        this.compileStyle();
        compiledStyle += this.get("style");
        compiledStyle += ";top:" + rect.y + "px";
        compiledStyle += ";left:" + rect.x + "px";
        compiledStyle += ";width:" + rect.width  + "px";
        compiledStyle += ";height:" + rect.height; + "px";
        dElem.setAttribute("style",compiledStyle);
        dElem.setAttribute("id", this.get("id"));

    },
    setId: function (id) {
        this.set("id",id);
        this.updateDom();
    },
    setStyle: function (css,value) {
        var ustyle = this.get("uncompStyle");
            ustyle[css] = value;
        this.set("uncompStyle",ustyle);
    },
    compileStyle: function (shallUpdate) {

        var style = "",
            ustyle = this.get("uncompStyle");

        for (css in ustyle) {
            style += this.camelCaseToDash(css)+ ":" + ustyle[css] + ";";
        }

        this.set("style", style);
    },
    camelCaseToDash: function (str) {

        return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    },
    destroy: function () {
        document.body.removeChild(this.get("domElement"));
    }
});


cms.addBlueprint("Movable",{
    config: {
        direction: {
            x: 0,
            y: 0,
            speed: 0
        },
        changedDirection: false
    },
    move: function (bound,deltaTime) {
        var rect = this.get("rect");
        var direction = this.get("direction");
        if (rect.x < bound.horizontal.min)
            direction.x = 1;

        if (rect.x > bound.horizontal.max)
            direction.x = -1;

        if (rect.y < bound.vertical.min)
            direction.y = 1;

        if (rect.y > bound.vertical.max)
            direction.y = -1;

        rect.x += direction.x * direction.speed * deltaTime;
        rect.y += direction.y * direction.speed * deltaTime;

        this.set("direction",direction);
        this.set("rect",rect);
        this.updateDom();
        this.reset("changedDirection");
    },
    changeDirection: function (x, y) {
        if (!this.get("changedDirection")) {
            var dir = this.get("direction");
            if (x == true)
                dir.x = -dir.x;
            if (y == true)
                dir.y = -dir.y;

           this.set("changedDirection",true);
        }
    },

});
cms.addBlueprint("Flashy",{
    someFlash: function() {
        return  "#" + Math.floor(Math.random() * 16777215).toString(16);
    },
    cameleonize: function() {

        this.setStyle("backgroundColor",this.someFlash());

    },
    setBGColor: function (color) {
        this.setStyle("backgroundColor","#"+color);
    }
});
cms.addBlueprint("PreyOrPredator",{
    config: {
        isPredator: false
    },
    collidedWith: function (object) {
        if (this.get("isPredator")) {
            if(!object.get("isPredator")) {
                // to continue here
                // here predator gets to kill prey and after some preys will bread on it's own
            }
        } else {
            if(!object.get("isPredator")) {
                // and here
                // here is breading



            }
        }
    },


});

cms.addBlueprint("Div",{
    mixins:["Flashy","Movable"],
    config: {
        elementType: "div",
        style: "position:absolute;border:solid 1px red;",
        rect: {
            x: 20,
            y: 20,
            width: 300,
            height: 200
        },
        id: "div",
        bgColor:"f55"
    },
    initialize: function () {
        this.setBGColor(this.get("bgColor"));
        this.callParent("initialize");
    }

},"extend","ScreenElement");

cms.addBlueprint("CollisionDetector",{
    config: {
        collisionList:{},
        radiusRatio:1.1
    },
    addToCollisionList: function (object) {
        var collisionList = this.get("collisionList");
        collisionList[object.$uniqueId] = object;
        this.set("collisionList", collisionList);
    },
    performCollisionCheck: function () {
        // this will be non optimized everyone collision check.
        var cList = this.get("collisionList");
        var radiusRatio = this.get("radiusRatio");
        for (var target in cList) {
            var tBound = cList[target].getBounds(),
                aEdges = {
                    top: tBound.y,
                    left: tBound.x,
                    bottom: tBound.y + tBound.height,
                    right: tBound.x + tBound.width
                },
                aCenter = {
                    x: tBound.x + tBound.width / 2,
                    y: tBound.y + tBound.height / 2
                },
                actionRadius = (tBound.width + tBound.height)/2;



            for (var checked in cList){
                if (target != checked) {
                    var cBound = cList[checked].getBounds(),
                        bHorizontal = false,
                        bVertical = false,
                        bCenter = {
                            x: cBound.x + cBound.width / 2,
                            y: cBound.y + cBound.height / 2
                        },

                        bEdges = {
                            top: cBound.y,
                            left: cBound.x,
                            bottom: cBound.y + cBound.height,
                            right: cBound.x + cBound.width
                        };

                    var distanceBetween = Math.sqrt(
                        ((bCenter.x - aCenter.x)*(bCenter.x - aCenter.x))+
                        ((bCenter.y - aCenter.y)*(bCenter.y - aCenter.y))
                        );
                    if (distanceBetween < actionRadius * radiusRatio) {
                        if (aEdges.top < bEdges.bottom || aEdges.bottom > bEdges.top)
                            bVertical = true;
                        if (aEdges.left < bEdges.right || aEdges.right > bEdges.left)
                            bHorisontal = true;
                        cList[checked].changeDirection(bHorizontal,bVertical);
                        cList[target].changeDirection(bHorizontal,bVertical);


                    }


                }
            }
        }

    }
});





//--------------- let's have some fun -----------------
var myDivs;
var CDI;
window.onload = function() {
    var cdtect = cms.makeInstance("CollisionDetector",{
    });
    CDI = cms.getInstance(cdtect);


    window.requestAnimationFrame(doit);
    time = new Date().getTime();

    addItems(10);

};



var time;

function doit(ts) {
    var now = new Date().getTime(),
        dt = now - (time || now);
    time = now;

    CDI.performCollisionCheck();

    myDivs = cms.getAllInstancesOfType("Div");
    var bounds = {
            horizontal: {
                min: 0,
                max: window.innerWidth
            },
            vertical: {
                min: 0,
                max: window.innerHeight
            }
        },
        dTime = dt/1000 || 1;

    for(var i = 0; i < myDivs.length; i++){

        var obJ = cms.getInstance(myDivs[i]);

        obJ.move(bounds,dTime);

    }



    window.requestAnimationFrame(doit);


}


function genHex(){
     var koo =  Math.floor(Math.random() * 16777215).toString(16);
     //console.log(koo);
     return koo;

}

function deleteAll(type,method){
    var arr = cms.getAllInstancesOfType(type);
    for(var i = arr.length; i--; ){
        cms.destroyInstance(arr[i],method);

    }

}
function addItems(number_){
     for (var i = 0; i < number_; i++) {

       var uid = cms.makeInstance({
            xtype: "Div",
            config: {
                rect: {
                    width: 10,
                    height: 10,
                    x: Math.floor(Math.random() * window.innerWidth),
                    y: Math.floor(Math.random() * window.innerHeight)
                },
                direction: {
                    x: 1,
                    y: 1,
                    speed: Math.floor(Math.random() * 20 + 2)
                },
                uncompStyle: {
                    position:"absolute"

                }
            }
        },"initialize");

        CDI.addToCollisionList(cms.getInstance(uid));

    }


}



