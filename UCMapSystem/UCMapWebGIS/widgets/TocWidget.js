define([
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/query",
    "dojo/dom-attr",
    "dojo/dom-style",
    "dojo/on",
    "dojo/_base/lang",
    "dijit/form/CheckBox",
    "./_BaseWidget",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/TocWidget.html",
    "dijit/form/HorizontalSlider"],
    function (declare, array, query, domAttr, domStyle, on, lang, CheckBox, _BaseWidget, _WidgetsInTemplateMixin, template) {
       
        return declare([_BaseWidget, _WidgetsInTemplateMixin], {
            layerNumNeedtoLoad: 10000, // 还需要加载的图层的数量，用于控制是否还需要进行初始化操作
            transparencyLayerID: "", // 用户在图层下拉列表框中选择的地图服务的ID
            //widgetsInTemplate: true,
            templateString: template,

            startup: function () {
                console.log("TocWidget::startup");
                this.inherited(arguments);
                if (this.layerNumNeedtoLoad === 0) {
                    return;
                }

                this.setToc();
                

            },

            setToc: function () {
                this.layerNumNeedtoLoad = this.map.layerIds.length;
                for (var i = 0; i < this.map.layerIds.length; i++) {
                    var layer = this.map.getLayer(this.map.layerIds[i]);
                    this.addToTOC(layer);
                }
            },

            addToTOC: function (layer) {
                if (layer.loaded) {
                    this.buildLayerList(layer);
                }
                else {
                    layer.on("load", lang.hitch(this, "layerLoaded"));
                }
            },

            layerLoaded: function (evt) {
                this.buildLayerList(evt.layer);
            },

            buildLayerList: function (layer) {
                var currentLayer = layer;
                var currentHTML = "";
                var expandImageUrl = require.toUrl("UCMapWebGIS/widgets/assets/images/expand.bmp");
                var blankImageUrl = require.toUrl("UCMapWebGIS/widgets/assets/images/blank.bmp");
                currentHTML += "<img src='" + expandImageUrl + "' id='" + currentLayer.id + "Icon' />";
                currentHTML += "<input type='checkbox' data-dojo-type='dijit/form/CheckBox' class='TOC_Root' " + (currentLayer.visible ? " CHECKED " : "") + " id='" + currentLayer.id + "'/>";
                currentHTML += "<label for='" + currentLayer.id + "'>" + currentLayer.id + "</label><br>";
                //console.log(currentHTML);
                var subLayers = currentLayer.layerInfos;//layerInfos以数组的形式返回服务中的图层，Returns the available layers in service and their default visibility.形式就是这样的：【Object,Object..】

                // 判断图层类型
                var isDynamicLayer = true;
                
                //declaredClass属性用来得到某个对象所对应声明类的名字
                if (layer.declaredClass === "esri.layers.ArcGISTiledMapServiceLayer") {
                    isDynamicLayer = false;
                }

                var imgSrcHtml = "<img src='" + blankImageUrl + "'/>";

                currentHTML += "<div id='" + currentLayer.id + "Layers' style='display:none;'>";
                
                for (var i = 0; i < subLayers.length; i++) {
                    var currentSubLayer = subLayers[i];

                    currentHTML += imgSrcHtml + imgSrcHtml;
                    if (isDynamicLayer === true) {
                        currentHTML += "<input type='checkbox' class='" + currentLayer.id + "TOC' " + (currentSubLayer.defaultVisibility ? " CHECKED " : "") + " id='" + currentSubLayer.id + "'/>";
                    }
                    currentHTML += "<label for='" + currentSubLayer.id + "'>" + currentSubLayer.name + "</label><br>"
                }
                currentHTML += "</table></div>";
                
                document.getElementById("toc").innerHTML = document.getElementById("toc").innerHTML + currentHTML;//这两个变量的顺序可以调整图层列表的顺序

                // 将图层名加到图层下拉列标框中
                this.addToTransparencyList(layer);

                this.layerNumNeedtoLoad--;
                // 只有当所有图层都加载完毕后，才能进行事件连接操作
                if (this.layerNumNeedtoLoad === 0) {
                    this.connectEvent();
                }
            },

            connectEvent: function () {
                console.log("connectEvent");
                // 加>表示选择直接子元素
                var imageChildren = query("#toc > img");
                for (var i = 0; i < imageChildren.length; i++) {
                    on(imageChildren[i], "click", lang.hitch(this, "toggleLayer"));
                }

                var inputChildren = dojo.query("#toc > input");
                for (var i = 0; i < inputChildren.length; i++) {
                    on(inputChildren[i], "click", lang.hitch(this, "toggleService"));
                }

                this.getAllNamedChildDijits();

                // 选择class属性值以“TOC”结束的所有input类型的节点
                var subLayerChildren = query('input[class$="TOC"]'); //console.log(subLayerChildren); 
                for (var i = 0; i < subLayerChildren.length; i++) {
                    on(subLayerChildren[i], "click", lang.hitch(this, "updateLayerVisibility"));
                }
            },

            addToTransparencyList: function (layer) {
                var selectObject = document.getElementById("transparencyList");
                //new Option()构造函数（JS）可创建一个<option>元素。一旦创建新的Option对象，它就可以追加到狗哥Select对象的options集合中。P966页。
                var optionObject = new Option(layer.id, layer.id);//这里传入的layer.id是：街道地图、影像、美国人口普查、路易斯维尔地籍这几个字。<option value="街道地图">街道地图</option>
                //options:当前select元素包含的Option元素组成的类数组对象。P972页
                selectObject.options[selectObject.options.length] = optionObject;
                
                var list = new Array();
                for (var i = 0; i < selectObject.options.length; i++) {
                    list.push(selectObject.options[i].value);
                }

                selectObject.options.length = 0;//这里将selsectObject.options.length的值设为1，是因为属性都保存到list数组里面了，list进行重排序后，将属性重新传递给selsectObject.options，用于<select>元素生成选项
                list.sort();
                
                for (var j = 0; j < list.length; j++) {
                    var optionObject = new Option(list[j], list[j]);
                    selectObject.options[selectObject.options.length] = optionObject;
                }
            },

            toggleLayer: function (evt) {
                var id = evt.currentTarget.id;//因为这里是当前事件的id,而并非DOM树中的id的引用，因此修改这个id，DOM树中id,如：“街道地图Icon”的值是不会发生变化的
                id = id.substring(0, id.length - 4);
                //console.log(evt.currentTarget.id);
                var layerDiv = document.getElementById(id + 'Layers');
                var icon = document.getElementById(id + 'Icon');
                if (layerDiv.style.display == 'block') {
                    icon.src = require.toUrl("UCMapWebGIS/widgets/assets/images/expand.bmp");
                    layerDiv.style.display = 'none';
                }
                else {
                    icon.src = require.toUrl("UCMapWebGIS/widgets/assets/images/close.bmp");
                    layerDiv.style.display = 'block';
                }
            },

            toggleService: function (evt) {
                var layerID = evt.currentTarget.id;
                var layer = this.map.getLayer(layerID);
                //console.log(layer.visible);
                if (layer.visible) {
                    
                    layer.hide(); 
                }
                else {
                    layer.show();
                }
            },

            updateLayerVisibility: function (evt) {
                var className = evt.currentTarget.className;
                var serviceID = className.substring(0, className.length - 3); // className为服务ID加TOC组成
                var inputs = query("." + serviceID + "TOC"),input;
                
                var visible = [];
                
                for (var i = 0, il = inputs.length; i < il; i++) {
                    if (inputs[i].checked) {//将<input>已选择的元素的id保存进visible数组
                        visible.push(inputs[i].id);
                    }
                }
                //debugger;
                //console.log(visible.length);
                var layer = this.map.getLayer(serviceID);//console.log(layer);
                layer.setVisibleLayers(visible); //console.log(visible);
            },

            updateTransparencyLayer: function (evt) {//在TocWidget.html中调用
                //alert(this.domNode.innerHTML);这里this是TocWidget.js定义的类。alert输出的是<div class="widgetPanel">整个标签内容
                //transparencyLayerID在一开始就定义了。
                this.transparencyLayerID = evt.currentTarget.value; //console.log(evt.currentTarget.value);还真设置了value值：“影像，美国人口普查，街道地图，路易斯维尔地籍”
                var layer = this.map.getLayer(this.transparencyLayerID);
                console.log(this.slider.domNode.innerHTML);
                if (layer != null) {
                    this.slider.setValue(layer.opacity * 100); //可以肯定，this.slider是TOCWidget.html中changeTransparency()函数所在的标签<div>，因为标签中定义了data-dojo-attach-point="slider"，因此可以用 . 符号访问<div>标签
                }
            },

            changeTransparency: function (evt) {
                var value = evt / 100;
                var layer = this.map.getLayer(this.transparencyLayerID);
                if (layer != null) {
                    layer.setOpacity(value);
                }
            },

            zoomToLayer: function (evt) {
                var id = document.getElementById("transparencyList").value;
                var layer = this.map.getLayer(id);
                if (layer != null) {
                    this.map.setExtent(layer.fullExtent);
                }
            }
            
        }); 
    });