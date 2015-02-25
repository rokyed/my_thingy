 function CMS () { 
     this.clsName = "ROOT";
     var me = this;
     this.classes = {};
     this.instantiatedClasses = {};
     this.instanceId = 0;
     this.liveVars = {};


     this.override = function (parentClass, contents) {
     
         var par = this.classes[parentClass];  
         // override parent functions
         for (item in contents) {
             if(item != "config" && item != "className")
                 me.copyItem(item, contents, par);
         }
         // override parent configs
         for (item in contents.config) {
             me.copyItem(item, contents.config, par.config);
         }

     };

     this.extend = function (processedContents, incommingContents, parentClass) {
         var par, i = 0; 
             
         par = this.classes[parentClass] ;
         // set the parent of the class
         processedContents["parentClass"] = par; 
         // copy class contents into a processed object ( to be processed)
         for (item in incommingContents) {
             me.copyItem(item, incommingContents, processedContents);
         }
         // copy items from parent to class if not in class
         /*for (item in processedContents) {
             var itemFound = false;
             for (item2 in par) {
                 if (item != item2 && !itemFound && par[item2] !== undefined && processedContents[item2] === undefined) {
                     me.copyItem(item2, par, processedContents);
                     itemFound = true;
                 }
             }
         }*/
         for (item in par) {
             if (!processedContents[item] && item != "config" && item != "className")
                 me.copyItem(item, par, processedContents);
         }
         // copy config ( config is like config in sencha touch)
         for (def in par.config) {
             var found = false;
             for (xdef in processedContents.config) {
                 if (xdef == def) {
                     found = true;
                 }
             }
             if (!found) {
                 me.copyItem(def, par.config, processedContents.config);
             }    

         }

     
     };

     this.processMixins = function (processedContents) {
         for (var i = 0; i <processedContents.mixins.length; i++) {
             var mixin = processedContents.mixins[i],
                 mxin = me.classes[mixin];
             for (item in mxin) {
                 if (item != "className" || item != "config") {
                     me.copyItem(item, mxin, processedContents);
                 }
             }
             
         
         }
         delete processedContents["mixins"];

     
     };
     this.setInitials = function (contents) {
         contents["initials"] = {};
         
         for (def in contents.config) {
             me.copyItem(def, contents.config, contents.initials);
         }

     
     };

     this.addBasics = function (processedContents,classname) {
         // generate universal getter , requires string (name of variable)
         processedContents["get"] = function (item) {
             return this.config[item];
         };
         // generate universal setter , requires string (name of variable), requires value as second param
         processedContents["set"] = function (item,value) {
             this.config[item] = value;
         };
         // generate universal setter , requires string (name of variable), requires value as second param
         processedContents["reset"] = function (item) {
             this.config[item] = this.initials[item];
         };
         // calling parent ( first paramenter is the function name , rest of parameters are parameters that parent function accepts)
         processedContents["callParent"] = function(functionName) {
             var fn = functionName;
             [].shift.apply(arguments);
             this.parentClass[fn].apply(this,arguments);
         
         };
         // set classname for the class
         processedContents["className"] = classname;

     };
     
     this.addClass = function (classname, itsContents, action, fromParent) {
         var processedContents = {};
         
         if (!itsContents["config"]) {
             itsContents["config"] = {};
         }

         if (!action || action == "define") {
             processedContents = itsContents;
         }

         if (action == "override" && fromParent) {
            this.override(fromParent, itsContents);
         }

         if (action == "extend" && fromParent) {
             this.extend(processedContents, itsContents, fromParent); 
         }
         // creating the initial values ( in order to reset a variable to it's initial state)
         this.setInitials(processedContents);
         
         // copying mixins to class 
         if (processedContents.mixins !== undefined) {
             this.processMixins(processedContents);         
         }

         this.addBasics(processedContents, classname);

         // creation is done
         this.classes[classname] = processedContents;
         
     };
     
     this.addPrefix = function ( prefix, word) { 
         word = word.substring(0,1).toUpperCase() + word.substring(1,word.length); 
         return prefix + word;

     };

     this.copyItem = function (itemName,fromObj,toObj){
         toObj[itemName] = fromObj[itemName];
     };

     this.mergeItems = function (objA, objB, overrideB) {
         var merged = this.clone(objB);
         for (item in objA){
             if(!merged[item] || overrideB)
                 this.copyItem(item, objA, merged);
         }
         
     };

     this.applySettings = function (settings,onInstance) {
         if (settings.config){
             for(item in settings.config){
                 me.copyItem(item, settings.config, onInstance.config);  
             }
         }
         for (item in settings) {
             if(item != "config" && item != "className"){
                 me.copyItem(item, settings, onInstance);
             }
         }
     };


     this.generateInstanceUID = function (classname) {
         return classname+this.instanceId++;
     };
   
     this.makeInstance = function () {
         var classname, settings, readyCall=false;

         if (arguments.length == 0)
             return;
         if (arguments.length == 1) {
             // if its object(settings)
             settings = arguments[0];
             classname = settings.type;
         }

         if (arguments.length == 2) {
             if ( typeof arguments[0] == "object") {
                 // if is object(settings) and callback 
                 settings = arguments[0];
                 classname = settings.type;
                 readyCall = arguments[1];

             } else {
                 // if is classname and object(settings)
                 classname = arguments[0];
                 settings = arguments[1];
             }

         }

         if (arguments.length >= 3) {
             //if its classname , object(settings) ,callback
             classname = arguments[0];
             settings = arguments[1];
             readyCall = arguments[2];
         }


         var refObj = this.classes[classname],
             newClone = this.clone(refObj),
             uid = this.generateInstanceUID(classname);

         this.applySettings(settings,newClone);

         this.instantiatedClasses[uid] = newClone;
         if(readyCall) {

             this.instantiatedClasses[uid][readyCall]();
         }
         this.instantiatedClasses[uid]["_unique_id"] = uid;
         return uid;
     };

     this.clone = function (obj) {
         if (obj == null || typeof(obj) != 'object')
             return obj;

         var temp = {}; 

         for (var key in obj) {
             if (obj.hasOwnProperty(key)) {
                 temp[key] = this.clone(obj[key]);
             }
         }
         return temp;
     };

     this.getInstance = function(uid) {
         return this.instantiatedClasses[uid];
     };
     this.getAllInstancesOfType = function(classname){
         var list = [];
         for (obj in this.instantiatedClasses) {
             if(this.instantiatedClasses[obj].className == classname){
                 list.push(obj);
             }
         }
         return list;
     };
   
    

}

// ---------------------------declaration of class management system-----------------------------------

var cms = new CMS();


/*
//------------------------------------------------ class blueprinting----------------------------------
// mixin ( no requirement to declare config)
cms.addClass("MXRock", {
     rockThePlace: function(motto){
         alert(motto);
     }
});
// base class ( no requirement to declare config ( mixin and base class are the same thing)
cms.addClass("Animal", {
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
cms.addClass("Bird", {
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
cms.addClass("Pigeon", {
    mixins:[
        "MXRock"
    ],

    singSong: function() {
        this.set("sing","gotta rock to stay alive");
        this.callParent("singSong","yeaahahhaaha");
    }
},"extend","Bird");

// overrides anything inside class to override 
cms.addClass("OVRDBird", {
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

cms.addClass("ScreenElement",{
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

cms.addClass("Div",{
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
    for (var i = 0; i < 3000; i++) {
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



