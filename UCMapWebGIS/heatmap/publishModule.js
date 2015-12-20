define([
    "dojo/_base/declare",
    "esri/map",
    "esri/geometry/Extent",
    "esri/layers/ArcGISTiledMapServiceLayer",
    "esri/layers/ArcGISDynamicMapServiceLayer",
    "esri/layers/FeatureLayer",
    "esri/tasks/IdentifyTask",
    "esri/tasks/IdentifyParameters",
    "esri/geometry/Polygon",
    "esri/tasks/query",
    "config/TempLayerConfig", "config/commonConfig",
    "heatmap/TempLayer",
    "dojo/_base/lang",
    "dojo/dom",
    "dojo/on",
],
    function (
        declare,
        Map,
        Extent,
        ArcGISTiledMapServiceLayer,
        ArcGISDynamicMapServiceLayer,
        FeatureLayer,
        IdentifyTask,
        IdentifyParameters,
        Polygon,
        Query,
        TempLayerConfig, commonConfig,
        TempLayer,
        lang,
        dom,
        on) {
        return declare(null, {
            config:{},
            customTemp: {},//是否自定义温度图层，若要自定义需在该类构造函数中引入温度图层url
            
            constructor: function (customUrls/*{name:"url",...}*/) {
                if (customUrls) {
                    var a=commonConfig.tempUrls,b=customUrls;                    
                    for (var i in b) {                       
                        if (a[i]) {
                            console.warn("ERROR\: illegal URLs\. You have defined a same urlName as in the 'config\/commconConfig\.js'");
                            console.log(this.customTemp);
                        } else {
                            this.customTemp = lang.mixin(a, b);
                            break; 
                        }
                    };
                };
                this.config = lang.mixin(TempLayerConfig,  commonConfig);
                //console.log(this.config.tempUrls);
            },
            

            createHeatMap: function () {
                //将两个配置属性传递到config
               // config = lang.mixin(TempLayerConfig, commonConfig);
                //console.log(config);
                //console.log(this.config);
                
                var map;
                var heatLayers=[],featureLayers=[];
                var identifyTask,identifyParams
                
                
                var config = this.config;
                var initExtent;
                initExtent = new Extent(config.showExtent);
                map = new esri.Map("map", {
                    extent: initExtent,
                    sliderStyle: "small"
                });
                //新建地图，
                var basemap = new ArcGISTiledMapServiceLayer(config.arcGISTiledMapServiceUrl);
                
                var tempUrls = config.tempUrls;

                map.addLayer(basemap);
                //初始化Identify查询条件
               // map.on("load", initIdentify);
                map.on('load', function (theMap) {
                    //HeatmapLayer
                    config.tempLayerConfig.map = map;
                    
                    for (var i in tempUrls) {
                        if (!heatLayers[i] || !featureLayers[i]) {
                            heatLayers[i] = null;
                            featureLayers[i] = null;
                        };
                        heatLayers[i] = new TempLayer(config.tempLayerConfig);
                        // 在地图中添加热度图图层
                        map.addLayer(heatLayers[i]);
                        map.resize();

                        featureLayers[i] = new FeatureLayer(tempUrls[i] + "/0", {
                            mode: FeatureLayer.MODE_ONDEMAND,
                            visible: false
                        });
                        map.addLayer(featureLayers[i]);
                        //getFeatures();
                        doIdentify(tempUrls[i],heatLayers[i]);
                        // map.on("extent-change", getFeatures);
                        // map.on("extent-change", doIdentify);
                        //这里很可能和this。featureLayer出问题
                        on(dom.byId('tog'), "click", function () {

                            if (heatLayers[i].visible) {
                                heatLayers[i].hide();
                            } else {
                                heatLayers[i].show();
                            }
                        });
                        on(dom.byId('tog2'), "click", function () {
                            if (featureLayers[i].visible) {
                                featureLayers[i].hide();
                            } else {
                                featureLayers[i].show();
                            }
                        });
                    };
                });

                function initIdentify(TempUrl) {
                    // 实例化IdentifyTask
                    //设置要查询数据的url
                    identifyTask = new IdentifyTask(TempUrl);
                   // console.log(identifyTask);
                    // IdentifyTask参数设置
                    identifyParams = new IdentifyParameters();
                    // 冗余范围
                    identifyParams.tolerance = 3;
                    // 返回地理元素
                    identifyParams.returnGeometry = true;
                    // 进行Identify的图层
                    identifyParams.layerIds = [0];
                    // 进行Identify的图层为全部
                    identifyParams.layerOption = IdentifyParameters.LAYER_OPTION_ALL;
                }
                function doIdentify(tempUrl, hLayer) {
                    var TempUrl = tempUrl, heatLayer = hLayer;
                    initIdentify(TempUrl);
                    var loc = map.extent;
                    var rings = [[loc.xmin, loc.ymax], [loc.xmax, loc.ymax], [loc.xmax, loc.ymin], [loc.xmin, loc.ymin], [loc.xmin, loc.ymax]];
                    var polygonJson = { "rings": [rings], "spatialReference": initExtent.spatialReference };
                    var newPolygon = new Polygon(polygonJson);
                    //设置查询几何图形
                    identifyParams.geometry = newPolygon;
                    // Identify范围
                    identifyParams.mapExtent = map.extent;
                    //执行查询
                    identifyTask.execute(identifyParams, function (idResults) {
                        var data = [];
                        if (idResults) {
                            data = idResults;
                        }
                        heatLayer.setData(data);
                    });
                }
                var judge = false;
                if (!judge) {
                    judge = true;
                    // 从要素图层中的得到当前显示范围中的所有要素
                    function getFeatures() {
                        // 创建查询
                        var query = new Query();
                        // 只查询当前显示范围内的要素
                        query.geometry = map.extent;
                        query.where = "1=1";
                        query.outSpatialReference = map.spatialReference;
                        //console.log(featureLayer.fields);
                        this.featureLayer.queryFeatures(query, function (featureSet) {
                            var data = [];
                            if (featureSet && featureSet.features && featureSet.features.length > 0) {
                                data = featureSet.features;
                            }
                            console.log(featureSet.features[0].attributes);
                            // 将数据赋给热度图图层
                            //  console.log(featureSet);
                            heatLayer.setData(data);

                        });
                    }
                }
            }


        });
    });
