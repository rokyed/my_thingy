
// ---------------------------declaration of class management system-----------------------------------

var cms = new CMS();


/*
//------------------------------------------------ class blueprinting----------------------------------
// mixin ( no requirement to declare config)
cms.addBlueprint("MXRock", {
     rockThePlace: function(motto){
         alert(motto);
     }
});
// base class ( no requirement to declare config ( mixin and base class are the same thing)
cms.addBlueprint("Animal", {
    config: {
        makeSound: "craaa",
        domElem: "div",
        domStyle: "background-color:#333333;min-width:100px;min-height:100px;position:absolute;top:10px;left:10px;",
        domObj: null
    },
    domTrace: function() {
        this.set("domObj", document.createElement(this.get("domElem")));
        this.get("domObj").setAttribute("style",this.get("domStyle"));
        document.body.appendChild(this.get("domObj"));
    },
    doSomeSounds: function() {
        alert( this.get("makeSound"));
    }
});
// extended class from base class note the action extend
cms.addBlueprint("Bird", {
    config: {
        sing: "pi pi pi po"
    },
    singSong: function() {
        for( var i = 0; i < 3; i ++ ) {
            alert(this.get("sing"));
        }
        alert(arguments[0]);
    }
},"extend","Animal");

// extended class from exended class
cms.addBlueprint("Pigeon", {
    mixins:[
        "MXRock"
    ],

    singSong: function() {
        this.set("sing","gotta rock to stay alive");
        this.callParent("singSong","yeaahahhaaha");
    }
},"extend","Bird");

// overrides anything inside class to override
cms.addBlueprint("OVRDBird", {
    config: {
        sing: " i'ma skatman!"
    },
    singSong: function() {
         alert(this.get("sing"));
    }
},"override","Bird");

//------------------------ class instantiation -------------------------------
// note last argument is optional ( callback with no arguments)

// also the method returns the unique id of the class

// note 'type' inside first argument(object) is the defining class
cms.makeInstance({
    type:"Animal",
    config:{
        domElem:"iframe",
        domStyle:"position:absolute;top:200px;left:500px;width:100px;height:200px;border: solid 3px #f00;background-color:#0f0"
    }
},"domTrace");
// note first argument(string) is the defining class
cms.makeInstance("Animal",
     {
         config:{
             domElem:"iframe",
             domStyle:"position:absolute;top:200px;left:0px;width:100px;height:200px;border: solid 3px #f00;background-color:#000"
         }
     },"domTrace");


//---------------------------new exemple ----------------------------------------------------------------------------
*/

cms.addBlueprint("ScreenElement",{
    config: {
        type: "",
        style: "",
        id: "",
        position: "absolute",
        rect: {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        },
        domElement: null

    },
    initialize: function() {
         this.set("domElement", document.createElement(this.get("type")));
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
    rectSetup: function(x, y, width, height,shallUpdate) {

        if(shallUpdate) this.updateDom();
    },
    updateDom: function () {
        var dElem = this.get("domElement"),
            rect = this.get("rect"),
            compiledStyle = "";
        compiledStyle += this.get("style");
        compiledStyle += ";position:" + this.get("position");
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
    destroy: function () {
           document.body.removeChild(this.get("domElement"));
    }
});

cms.addBlueprint("Div",{
    config: {
        type: "div",
        style: "position:absolute;border:solid 1px red;",
        uncompStyle: {
            position:"absolute",
            border:"solid 1px red"
        },
        rect: {
            x: 20,
            y: 20,
            width: 300,
            height: 200
        },
        direction: {
            x: 0,
            y: 0,
            speed: 0


        },
        id: "div"
    },
    initialize: function() {
         this.compileStyle();
         this.callParent("initialize");
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
    },
    camelCaseToDash: function (str) {

         return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }


},"extend","ScreenElement");



//--------------- let's have some fun -----------------
var myDivs;
window.onload = function() {

    for (var i = 0; i < 20; i++) {
        var hx = genHex();
        cms.makeInstance({
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
                    speed: Math.floor(Math.random() * 4 + 2)
                },
                uncompStyle: {
                    position:"absolute",
                    backgroundColor:"#"+hx
                }
            }
        },"initialize");
    }
// non traditional class declaring
    for (var i = 0; i < 20; i++) {
        var hx = genHex();
        cms.makeInstance({
            blablidylbla: "Div",
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
                    speed: Math.floor(Math.random() * 10 + 2)
                },
                uncompStyle: {
                    position:"absolute",
                    borderRadius:"5px",
                    backgroundColor:"#"+hx,

                }
            }
        },"initialize");
    }


    window.requestAnimationFrame(doit);


};


var oldTS = null;

function doit(ts) {
    myDivs = cms.getAllInstancesOfType("Div");
    var bounds = {
            horizontal: {
                min: window.innerWidth / 4,
                max: 3 * window.innerWidth / 4
            },
            vertical: {
                min: window.innerHeight / 4,
                max: 3 * window.innerHeight / 4
            }
        },
        dTime = 1/(ts - oldTS);

    for(var i = 0; i < myDivs.length; i++){

        var obJ = cms.getInstance(myDivs[i]);

        obJ.move(bounds,dTime);
    }
   // debugger;

    oldTS = ts;
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
        var hx = genHex();
        cms.makeInstance({
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
                    speed: Math.floor(Math.random() * 4 + 2)
                },
                uncompStyle: {
                    position:"absolute",
                    backgroundColor:"#"+hx
                }
            }
        },"initialize");
    }

}



