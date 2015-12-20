define(['dojo/dom', "dojo/dom-construct", "dojo/_base/window", "dojo/_base/declare", "dojo/_base/array", "dojo/query", "dojo/topic", "dojo/dom-attr", "dojo/dom-style", "dojo/on", "dojo/_base/lang", "dojo/fx", "dojo/_base/fx", "dojo/dom-geometry",
    "dijit/layout/TabContainer", "dijit/layout/ContentPane", 
    "./_Widget", "dojo/text!./templates/TabPane.html"],
    function (dom, domConstruct, win, declare, array, query, topic, domAttr, style, on, lang, coreFx, fx, domGeom, TabContainer, ContentPane, _Widget, template) {
        return declare(_Widget, {
            tabContainer: null,//用来存储模板中的tabContainer节点
            tc: null,//使用该属性创建tabContainer小部件
            slideOut: true,//判断tabContainer面板是否已经显示
            thisTab: null,//储存模板中的tabPane节点，该节点是tabContainer的容器，slide动画改动的根节点即为该节点
            insertLoc:null,//在DOM树中插入该面板的节点位置
            templateString: template,
            tab:[],
            cp2:null,

            

            postCreate: function () {
                console.log("TabPane::postCreate");

                var children = this.getChildren();
                array.forEach(children, function (child) { child.startup(); });
                
             
                //query是查不到template的顶级的根节点的
                this.tabContainer = query(".tabContainer", this.domNode)[0];
                this.thisTab = query(".tabPane",this.domNode)[0];
                this.insertLoc = query(".wrap-group.full-height.level")[0];
                
                // 订阅showWidget事件
                topic.subscribe("tabShow", lang.hitch(this, "onShowTab"));
               
            },
            startup: function () {
                if (this._started) {
                    return;
                }

                on(document.getElementById("basicFadeButton2"), "click", lang.hitch(this, "slideTabPane"));
                this.inherited(arguments);
                console.log("TabPane startup.");
                
                
            },

            onShowTab: function () {
                
                this.tc = new TabContainer({
                    style: "height: 100%; width: 100%;"
                }, this.tabContainer);
                this.cp2 = new ContentPane({
                    title: "test",
                    content: "This pane is for the test."
                });
                this.tc.addChild(this.cp2);
                
                this.placeAt(this.insertLoc);
                this.tc.startup();
                console.log("onShowTab::finished");              
                
            },
            //下面的方法是dojo官网给的slideTo动画代码
            slideTabPane: function () {
                var amt = 410;
                
                target = this.thisTab;
                
                if (this.slideOut) {
                    amt = 0 - amt; this.slideOut = false;
                } else {
                    this.slideOut = true; 
                };
               
                coreFx.slideTo({
                    node: target,
                    top: domGeom.getMarginBox(target).t.toString(),
                    left: (domGeom.getMarginBox(target).l + amt).toString(),
                    unit: "px",
                    duration: 100
                }).play();
            },
            setChild: function (/*ContentPane*/widget) {
                //console.log(widget.theme);//可以通过看widget对象属性发现theme属性为传入进来的esriLayerList小部件。详细信息看widget
                var index = widget.theme;//index="esriLayerList"
                //保证图层控制面板只设置一次，后面图层更新直往面板里面更新内容，不重新创建一个新的图层控制面板
                if (widget.theme && !this.tab[index]) {
                   
                    this.tab[index] = new ContentPane({
                        title: "图层控制面板",
                        content: ""
                    });
                    this.tc.addChild(this.tab[index]);
                };

                if (widget.theme && this.tab[index]) {
                    //下面的循环保证所有this.tab[index]的子类都清除掉，即保证图层控制面板清空，然后再继续向里面插入新的内容
                    var children = this.tab[index].getChildren();
                    array.forEach(children, lang.hitch(this, function (child) {
                        this.tab[index].removeChild(children);
                    }));

                    this.tab[index].addChild(widget);
                    
                    console.log("esri\/dijit\/LayerList finished");
                } else {
                    alert("Wrong esri\/dijit\/LayerList！");
                };
            },
            delChild: function (widget) {
                var father = widget.getParent();
                //console.log(father);             
                if (widget.theme) {
                    father.removeChild(widget);
                }
            }
           

        });
    });
