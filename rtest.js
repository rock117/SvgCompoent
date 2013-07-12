define(function(require) {
	var Tool = require('mr-tool/tool'), Handlebars = require('handlebars'), ajax = require('M4/ajax'), $ = require('M4jquery'), M4 = require('M4Core');
	var html = require("text!mr-rtest/html/rtest.html");
	var ChartCore = require("M4chart/chartcore");
	require("css!mr-rtest/css/rtest.css");
	var E = {
		ICON_CLICK : "icon_click",
		ICON_OVER : "icon_over",
		ICON_OUT : "icon_out",
		BACK_CLICK : "back_click",
		MAIN_OVER : "main_over",
		MAIN_OUT : "main_out",
		MAIN_CLICK : "main_click",
		MAIN_DBLCLICK : "main_dblclick",
		MAIN_CONTEXTMENU : "main_contextmenu",
		AXIS_CLICK : "axis_click",
		MOVE_VALUE : "move_value",
		MOVE_INDEX : "move_index",
		DRILL_DOWN : "drill_down"
	};
	E = $.extend(ChartCore.E, E);
	var S = ChartCore.S;
	var T = ChartCore.T;
	var C = {};

	var TestChart = function(_container) {
		this.events = E;
		this.option = this.defaultOption();
		this.style = this.defaultStyle();
		// container
		this.container = $(_container);
		this.width = this.container.width();
		this.height = this.container.height();
		this.offset = this.container.offset();
		this.init();
	};
	TestChart.prototype = {
		init : function(){
			var self = this;
			this.container.empty().css({
				position : S.RELATIVE
			});
			// main graph =====================================================
			// using for export, do NOT append any other elements to graph
			this.graph = $(S.DIV).unselectable().css({
				position : S.ABSOLUTE
			}).appendTo(this.container);
			// SVG ============================================================
			// graph renderer, using SVG
			this.renderer = new ChartCore.Renderer(S.SVG);
			this.svg_root = this.renderer.init(this.width, this.height);
			//background ======================================================
			this.svg_back = $(this.renderer.drawGroup({}, this.svg_root));
			//coordinate ======================================================
			this.svg_coordinate = $(this.renderer.drawGroup({}, this.svg_root));
			this.coordinate = new ChartCore.Coordinate(this);
			//main =============================================================
			this.svg_main = $(this.renderer.drawGroup({}, this.svg_root));
	        this.graph.append(this.svg_root);
			return this;
		},
		
		drawMain : function(){
			var data = {"stroke-width":4,"stroke":"#bbbbbb","x1":0,"x2":300,"y2":300,"y1":0};
			var parent = $("svg");//this.el.find("svg");
		//	this.renderer.drawLine(data, parent);
			var d = false;
			this.drawTransform();
		},
		drawTransform : function(){
			this.drawDimension(100);
			this.drawDimension(300);
			this.drawDimension(450); 
			this.drawLines();
		},
		drawDimension : function(x, y){
			
			var dimension = this.renderer.drawGroup({'class': 'dimension', transform:'translate('+x+',300)'}, this.svg_root);
			this.drawDimensionAxis(dimension);
			this.drawDimensionBrush(dimension);
			//<path class="domain" d="M-6,1H0V165H-6"></path>
			// this.renderer.drawPath({'class':'domain', d:'M-6,1H0V165H-6'}, dimension);
			this.renderer.drawLine({x1:0, y1:0, x2:0, y2:300, 'class':'domain', 'stroke-width':3, stroke:'grey'},dimension);
			this.renderer.drawText({x:0, y:-10, 'class':'label', 'text-anchor':'middle'}, dimension, 'economy (mpg)');
			this.bindEvent();
		},
		bindEvent : function(){
			var $svg = $(this.svg_root);
			$svg.delegate(".extent", "click", function(){
				alert('click')
			});
		},
		drawDimensionBrush : function(dimension){
			var brush = this.renderer.drawGroup({'class':'brush'}, dimension);
			$(brush).css("pointer-events", "all");
			
			this.renderer.drawRect({"class": "background", y: 1, height: 300, x: -15, width: 30, style: "cursor: crosshair;", fill:"none"}, brush);//<rect class="background" y="1" height="164" x="-15" width="30" style="cursor: crosshair;"></rect>
			this.renderer.drawRect({"class": "extent", y: 0, height: 20, x: -15, width: 30, style: "cursor: move;", 'fill-opacity':0.3}, brush);//<rect class="extent" y="0" height="0" x="-15" width="30" style="cursor: move;"></rect>


			// var resizeN = this.renderer.drawGroup({"class": "resize n", transform: "translate(0,0)", style: "cursor: ns-resize; display: none;"}, brush);
			// var resizeNRect = this.renderer.drawRect({"y": -3, width: 30, height: 6, x: -15}, resizeN);
// 
			// var resizeS = this.renderer.drawGroup({"class": "resize s", transform: "translate(0,0)", style: "cursor: ns-resize; display: none;"}, brush);
			// var resizeSRect = this.renderer.drawRect({"y": -3, width: 30, height: 6, x: -15}, resizeS);			
			var resizeNRect = this.renderer.drawRect({"class": "resize n", "y": 3, width: 30, height: 6, x: -15, style: "cursor: ns-resize; visibility: hidden;"}, brush);
			var resizeSRect = this.renderer.drawRect({"class": "resize s", "y": 30, width: 30, height: 6, x: -15, style: "cursor: ns-resize; visibility: hidden;"}, brush);
		},
		drawLines : function(){
			var lines = this.renderer.drawGroup({'class':'lines'}, this.svg_root); 
			// var ps1, ps2, ps3;
			// this.renderer.drawPolyline({fill:'none', stroke: 'blue', points:px1}, lines);
			// this.renderer.drawPolyline({fill:'none', stroke: 'blue', points:px2}, lines);
			// this.renderer.drawPolyline({fill:'none', stroke: 'blue', points:px3}, lines);
		},
		drawDimensionAxis : function(dimension){
			var axis = this.renderer.drawGroup({'class':'axis'}, dimension);
			this.drawTickMajorOfAxis(axis, 10, 0);
			this.drawTickMajorOfAxis(axis, 20, 50);
			this.drawTickMajorOfAxis(axis, 30, 100);
			this.drawTickMajorOfAxis(axis, 40, 150);
			
			this.drawTickMajorOfAxis(axis, 50, 200);
			this.drawTickMajorOfAxis(axis, 60, 250);
		},
		drawTickMajorOfAxis : function(axis, txt, y){
			var tickMajor = this.renderer.drawGroup({'class':'tick major', style:'opacity: 1;', stroke:"grey"}, axis);
			this.renderer.drawLine({y1:y, x2:-9, y2:y}, tickMajor);
			var text = this.renderer.drawText({x:-13, y:y, dy:'0.32em', style:'text-anchor: end;'}, tickMajor, txt);
			
		},
		
	};
	TestChart.prototype = $.extend(new ChartCore.ChartBase(), TestChart.prototype);
	TestChart.prototype.constructor = TestChart;

	var RtestApp = function() {
	};
	RtestApp.prototype = {
		renderUI : function() {
			this.el.append(html);
			this.testChart = new TestChart(".rtest");
			this.testChart.setData({});
		}

	};


	function Dimension(){
		
	}

	var Axle = function(title, h, data, opt){
		this.data = data;
		this.title = title;
		this.opt = opt || opt;
	}
	Axle.prototype = {
		draw : function(){}
	};
	Tool.extend(RtestApp);
	return RtestApp;
});
