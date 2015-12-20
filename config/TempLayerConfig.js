define({
    tempLayerConfig: {
        config: {
            "useLocalMaximum": true,
            "radius": 10,
            "gradient": {
                0.15: "rgb(000,000,255)",
                0.55: "rgb(000,255,255)",
                0.65: "rgb(000,255,000)",
                0.95: "rgb(255,255,000)",
                1.00: "rgb(255,000,000)"
            },
            "debug": false,
            "visible": true
        },
        "map": map,                     //地图对象
        "domNodeId": "heatLayer",       //使用canvas绘制热度图的<div>标签的id
        "opacity": 0.85,               
        "tempDataField": "温度",       //绘制热度图使用的Value的字段名称，绘制温度图即为温度属性字段名称
    }
});