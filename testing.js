
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
    camelCaseToDash: function (str) {
         return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }
         
    
},"extend","ScreenElement");

//--------------- let's have some fun -----------------
var myDivs; 
window.onload = function() {
    for (var i = 0; i < 300; i++) {
        var hx = genHex();
        cms.makeInstance({
            type: "Div",
            config: {
                 rect: {
                     width: 10,
                     height: 10,
                     x: Math.floor(Math.random() * window.innerWidth),
                     y: Math.floor(Math.random() * window.innerHeight)
                 },
                 uncompStyle: {
                     position:"absolute",
                     backgroundColor:"#"+hx
                 }
            }
        },"initialize");
    }
    myDivs = cms.getAllInstancesOfType("Div");
      
};


var timerT = window.setInterval(function(){doit();},1);

function doit() { 
    for(var i = 0; i < myDivs.length; i++){
        
        var obJ = cms.getInstance(myDivs[i]),
            pos = obJ.get("rect");
        if(pos.x < -pos.width) pos.x = window.innerWidth;
        if(pos.y < -pos.height) pos.y = window.innerHeight;
        pos.x -= Math.random() * 2;
        pos.y -= Math.random() * 2;
        

        obJ.position(pos.x,pos.y,true);
    }

}

function genHex(){
   
    return Math.floor(Math.random() * 16777215).toString(16);    
    
}



