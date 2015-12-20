require([
    "esri/map",
    "esri/geometry/Extent",
    "esri/layers/ArcGISTiledMapServiceLayer",
    "esri/layers/ArcGISDynamicMapServiceLayer",
    "esri/layers/FeatureLayer",
    "esri/tasks/IdentifyTask",
    "esri/tasks/IdentifyParameters",
    "esri/geometry/Polygon",
    "esri/tasks/query",
    "config/TempLayerConfig","config/commonConfig",   
    "heatmap/TempLayer",
    "dojo/_base/lang",
    "dojo/dom",
    "dojo/on",
    "dojo/domReady!"],
    function (
        Map,
        Extent,
        ArcGISTiledMapServiceLayer,
        ArcGISDynamicMapServiceLayer,
        FeatureLayer,
        IdentifyTask,
        IdentifyParameters,
        Polygon,
        Query,
        TempLayerConfig,commonConfig,        
        TempLayer,
        lang,
        dom,
        on)
    {
        var map;
        var heatLayer;
        var featureLayer;
        var identifyTask, identifyParams;
        var config = {};
        var initExtent = null;
        //将两个配置属性传递到config
        config = lang.mixin(TempLayerConfig, commonConfig);
        initExtent = new Extent(config.showExtent);

        map = new esri.Map("map", {
            extent: initExtent,
            sliderStyle: "small"
        });

        var basemap = new ArcGISTiledMapServiceLayer(config.arcGISTiledMapServiceUrl);
        var TempUrl = config.tempUrl;

        map.addLayer(basemap);
        //初始化Identify查询条件
        map.on("load", initIdentify);
        map.on('load', function (theMap) {
            //HeatmapLayer
            config.tempLayerConfig.map = map;
            heatLayer = new TempLayer(config.tempLayerConfig);
            // 在地图中将热度图图层
            map.addLayer(heatLayer);
            map.resize();

            featureLayer = new FeatureLayer(TempUrl + "/0", {
                mode: FeatureLayer.MODE_ONDEMAND,
                visible: false
            });
            map.addLayer(featureLayer);

            //getFeatures();
            doIdentify();
            // map.on("extent-change", getFeatures);
            // map.on("extent-change", doIdentify);
            on(dom.byId('tog'), "click", function () {

                if (heatLayer.visible) {
                    heatLayer.hide();
                } else {
                    heatLayer.show();
                }
            });
            on(dom.byId('tog2'), "click", function () {
                if (featureLayer.visible) {
                    featureLayer.hide();
                } else {
                    featureLayer.show();
                }
            });
        });

        function initIdentify(evt) {
            // 实例化IdentifyTask
            identifyTask = new IdentifyTask(TempUrl);
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
        function doIdentify() {
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
                featureLayer.queryFeatures(query, function (featureSet) {
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
    });