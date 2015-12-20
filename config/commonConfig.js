define({
    
    mapUrls: {
        //arcGISTiledMapServiceUrl: "//localhost:6080/arcgis/rest/services/西安温度发布/MapServer",
        //LuoYangLandUseUrl:"//"zj-pc/arcgis/rest/services/洛阳水体/MapServer
        arcGISTiledMapServiceUrl: "http://localhost:6080/arcgis/rest/services/洛阳用地属性/MapServer",
        //tempUrl: "",//zj-pc/arcgis/rest/services/yulin/MapServer
        LuoYangLandUseUrl:"http://localhost:6080/arcgis/rest/services/西安温度发布/MapServer"
    },

    //底图的url//"server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer",//"zj-pc/ArcGIS/rest/services/xian/MapServer"//zj-pc/arcgis/rest/services/count/MapServer
    arcGISTiledMapServiceUrl: "http://localhost:6080/arcgis/rest/services/西安温度发布/MapServer",
    //温度数据的url,点图层zj-pc/arcgis/rest/services/count/MapServer
    tempUrl: "http://localhost:6080/arcgis/rest/services/西安温度发布/MapServer",
    //设置初始地图显示范围
    tempUrls: {
        xiAn: "http://localhost:6080/arcgis/rest/services/西安温度发布/MapServer"
    },
    showExtent: {
        xmax: 12154789.5188,
        xmin: 12097283.2057,
        ymax: 4098529.5953,
        ymin: 4036690.6247,
        "spatialReference": {
            "wkid": 3857
        }
    },
});