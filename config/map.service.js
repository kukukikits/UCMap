var map;
var toc = null;
var MRContainer = null, MRContent = null, drawWidget = null, tocWidget = null;
require([
    "dojo/parser", "dojo/dom-form", "dojo/dom", "dojo/on",
    "dojo/_base/window",
    "dojo/dom-style",
    "dojo/topic",
    "dojo/query", 
    "dijit/registry", "dijit/form/CheckBox",
    
    
    "esri/map",
    "esri/layers/ArcGISTiledMapServiceLayer",
    "esri/layers/ArcGISDynamicMapServiceLayer",
    "esri/dijit/LayerList",
    "UCMapWebGIS/widgets/TocWidget",
    "UCMapWebGIS/widgets/DrawWidget",
    "UCMapWebGIS/widgets/_BaseWidget",
    "UCMapWebGIS/widgets/MoveableWidgetFrame", "UCMapWebGIS/widgets/TabPane",
    "dijit/layout/TabContainer", "dijit/layout/ContentPane",
    "dijit/_TemplatedMixin",
    "dojo/text!UCMap/UCMapWebGIS/widgets/templates/PanelTitle.html",
    "config/commonConfig",
    "dojo/string","dijit/form/Form", "dijit/form/Button","dijit/form/ValidationTextBox",
    "dojo/domReady!"],
    function (
        parser,domForm,dom,on,
        win,
        domStyle,
        topic,
        query,
        registry,CheckBox,
        Map,
        ArcGISTiledMapServiceLayer,
        ArcGISDynamicMapServiceLayer,
        LayerList,
        TocWidget,
        DrawWidget,
        _BaseWidget,
        MoveableWidgetFrame,TabPane,
        TabContainer,ContentPane,
        _TemplatedMixin, template,
        commonConfig,
        string
        )
    {
        parser.parse();
       
        var layerList = null;
        var domNode = template;
        var layers = [];
        var tab = null;
        var parentNode = document.getElementById("panelTop");
        parentNode.innerHTML = domNode; 
        //window.onload = widgetTopicPublish;window.onload在搜狗的兼容模式下会发生冲突，导致widgetTopicPublish函数调用不成功，改用直接调用函数就解决问题了
        map = new Map("mapDiv");

        
        
       
       createWidget();
       createDrawWidget();
       createMapViewWidget();
       createTab();
       //createMRContainer();
      
       function createMRContainer() {
           var insertLoc = document.getElementById("mapResLoc");
           console.log("createMRContainer::finished");
           MRContainer = new TabContainerFrame();
           MRContent = new _BaseWidget();
           MRContent.setTitle("地图资源容器");
           MRContent.setMap(map);
           MRContent.startup();
           
           MRContainer.setWidget(MRContent);
           domStyle.set(MRContent.domNode, "top", "50%");
           domStyle.set(MRContent.domNode, "left", "40%");
           MRContainer.placeAt(insertLoc);
           MRContainer.startup();
           
       };
        function createWidget() {
            toc = new TocWidget();
            toc.setTitle("图层控制器");
            
        };
        function createDrawWidget() {
            drawWidget = new DrawWidget();
            drawWidget.setTitle("绘图工具");
            drawWidget.setMap(map);
            drawWidget.startup();
        };
        function createMapViewWidget() {
            tocWidget = new _BaseWidget();
            tocWidget.setTitle("可用地图资源");
            tocWidget.setMap(map);
            tocWidget.startup();
        };
        //发布小部件主题
        widgetTopicPublish();
        function widgetTopicPublish() {
            
            var viewMap = document.getElementById("view-map");
            var editor = document.getElementById("editor");
            var viewResources = document.getElementById("view-resources");
            var home = document.getElementById("home");
            viewMap.onclick = function () {
                toc.setMap(map);
                //这里有个缺点就是只能在刚开始加载已有的服务，后来加载进来的服务不能显示
                topic.publish("showWidget", toc);
               // toc.setToc();
            };
            editor.onclick = function () {
                topic.publish("showWidget", drawWidget);
            };
            viewResources.onclick = function () {                
                topic.publish("showMapResources", tocWidget);
                topic.publish("tabShow", tocWidget);
                setMapResToPanel();
                
            };
            home.onclick = function () {
                
            };           
        };
        
        function showCoordinates(event) {
            var level = map.getLevel();
            var pres = Math.min(6, level);
            var x = event.mapPoint.x.toFixed(0);
            var y = event.mapPoint.y.toFixed(0);
            document.getElementById('mapPointPosition').innerHTML = string.substitute('${0},${1}', [x, y]);

        };

        function setMapResToPanel() {
            ///<summary>该方法通过查询config文件中的commonConfig文件来确定服务器准备了哪些服务（以url的形式保存），并把这些服务的名称通过innerHTML动态插入到DOM树中用于显示</summary>
            ///<param null></param>
            ///<returns></returns>
            
            var mapUrls = {}, mapName = {};
            mapUrls = commonConfig.mapUrls;
            var insertLocation,insertContent="";
            insertLocation = query("#Map_Res")[0];
            insertContent = "<form id='myform'>";


            //console.log(insertLocation);
            for (var i in mapUrls) {
                //定义正则表达式，提取url中地图服务的名字
                var url = /\/arcgis\/rest\/services\/(\S*)?(?=\/MapServer)/;
                var text = mapUrls[i];
                //用match函数和url正则表达式提取
                var mName = text.match(url)[1];
                mapName[i] = mName;
                //console.log(insertLocation);
                insertContent += "<input name="+i+" value="+mName+" type='checkBox' /><img class='mapInfo' src='UCMapWebGIS/widgets/assets/images/small_icons/i_resources.png' style='height:auto' />&nbsp&nbsp"
                    + mName + "<br/>";
         
            }
            insertContent += "<button id='convertForm' type='button' value='确定''>click me</button></form>";
            insertLocation.innerHTML = insertContent;
            console.log("getMapResources::finished");
            //将上面的<button>和click事件链接起来，使用domForm.toObject(dojo/dom-form::toObject)方法把input的选择状况以对象的类型返回
            on(dom.byId("convertForm"), "click", function () {
                var formObject = domForm.toObject("myform");//myform是<form>标签的id
                //console.log(formObject);
                var chosenUrls = [];
                for (var i in formObject) {
                    var j = formObject[i];
                   // console.log(j);
                    chosenUrls[j] = "";
                    chosenUrls[j] = mapUrls[i];
                   
                }
                 //console.log(chosenUrls);
                setMapResToScreen(chosenUrls);
            });


           
        };
        function setMapResToScreen(Urls) {
            //确保只设置一次，刚开始layerList为空，进入设置。一旦layerList被创建说明此时已经存在图层，不需要再一次用on绑定showCoordinates
            if (!layerList) {
                map.on('mouse-move', showCoordinates);
                map.on('mouse-drag', showCoordinates);
            };
            var chosenUrls = Urls;
            for (var i in chosenUrls) {
                //这里需要加入一个判断map中是否已经存在layer[i]这样就避免重新加载！！！！！！！！
                

                    layers[i] = new esri.layers.ArcGISDynamicMapServiceLayer(chosenUrls[i], { id: i });
                    layers[i].setOpacity(1);
                    map.addLayer(layers[i]);
               
            };           
            //LayerList中的layers属性一旦与map中的图层建立连接后，会直接与map中的图层相关，只要map中存在图层，LayerList就会显示出（与我在这里定义的:var layers=[]并无太大关系），
            if (layerList) {
                //console.log(layerList);将旧的LayerList从tab里面移除
                tab.delChild(layerList);
            };
            //新建图层列表
            layerList = new LayerList({ map: map, layers: layers });
            tab.setChild(layerList);
            layerList.startup();
            
            
        };


        
        function createTab() {
           
            
            tab = new TabPane();            
            tab.setMap(map);
            
            tab.startup();
            
        };

        
      
    });
