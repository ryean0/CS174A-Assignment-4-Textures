import {tiny} from './tiny-graphics.js';
const {color, Scene} = tiny;
export const widgets = {};

const Canvas_Widget = widgets.Canvas_Widget =
    class Canvas_Widget {
        constructor(element, initial_scenes, options = {}) {
            this.element = element;
            const defaults = {show_canvas: true, make_controls: true, show_explanation: false, make_editor: false, make_code_nav: false};
            if (initial_scenes && initial_scenes[0]) Object.assign(options, initial_scenes[0].widget_options);
            Object.assign(this, defaults, options)
            const rules = [".canvas-widget { width: 1080px; background: White; margin:auto }", ".canvas-widget canvas { width: 1080px; height: 600px; margin-bottom:-3px }"];
            if (document.styleSheets.length == 0) document.head.appendChild(document.createElement("style"));
            for (const r of rules) document.styleSheets[document.styleSheets.length - 1].insertRule(r, 0)
            if (this.show_explanation) { this.embedded_explanation_area = this.element.appendChild(document.createElement("div")); this.embedded_explanation_area.className = "text-widget"; }
            const canvas = this.element.appendChild(document.createElement("canvas"));
            if (this.make_controls) { this.embedded_controls_area = this.element.appendChild(document.createElement("div")); this.embedded_controls_area.className = "controls-widget"; }
            if (!this.show_canvas) canvas.style.display = "none";
            this.webgl_manager = new tiny.Webgl_Manager(canvas, color(0, 0, 0, 1));
            if (initial_scenes) this.webgl_manager.scenes.push(...initial_scenes);
            if (this.make_controls) this.embedded_controls = new Controls_Widget(this.embedded_controls_area, this.webgl_manager.scenes);
            this.webgl_manager.render();
        }
    }

const Controls_Widget = widgets.Controls_Widget =
    class Controls_Widget {
        constructor(element, scenes) {
            const rules = [".controls-widget * { font-family: monospace }", ".controls-widget div { background: White }", ".controls-widget table { border-collapse: collapse; display:block; overflow-x: auto; table-layout: fixed;}", ".controls-widget table.control-box { width: 1080px; border:1px; margin:0; max-height:380px; transition:.5s; overflow-y:scroll; background:white }", ".controls-widget table.control-box:hover { max-height:500px }", ".controls-widget table.control-box td { overflow:hidden; border:1px; background:Black; border-radius:10px; width: 540px;}", ".controls-widget table.control-box td .control-div { background: White; height:338px; padding: 5px 5px 5px 30px; }", ".controls-widget table.control-box td * { background:transparent }", ".controls-widget table.control-box .control-div td { border-radius:unset }", ".controls-widget table.control-box .control-title { padding:7px 40px; color:white; background:#252424;}", ".controls-widget *.live_string { display:inline-block; background:unset }", ".controls-widget button { background: #303030; color: white; padding: 3px; border-radius:5px; transition: background .3s, transform .3s }", ".controls-widget button:hover, button:focus { transform: scale(1.1); color:#FFFFFF }"];
            const style = document.head.appendChild(document.createElement("style"));
            for (const r of rules) document.styleSheets[document.styleSheets.length - 1].insertRule(r, 0)
            const table = element.appendChild(document.createElement("table"));
            table.className = "control-box";
            this.row = table.insertRow(0);
            this.panels = [];
            this.scenes = scenes;
            this.render();
        }
        make_panels(time) {
            this.timestamp = time;
            this.row.innerHTML = "";
            const open_list = [...this.scenes];
            while (open_list.length) {
                open_list.push(...open_list[0].children);
                const scene = open_list.shift();
                const control_box = this.row.insertCell();
                this.panels.push(control_box);
                control_box.appendChild(Object.assign(document.createElement("div"), {textContent: scene.constructor.name, className: "control-title"}))
                const control_panel = control_box.appendChild(document.createElement("div"));
                control_panel.className = "control-div";
                scene.control_panel = control_panel;
                scene.timestamp = time;
                scene.make_control_panel();
            }
        }
        render(time = 0) {
            const open_list = [...this.scenes];
            while (open_list.length) { open_list.push(...open_list[0].children); const scene = open_list.shift(); if (!scene.timestamp || scene.timestamp > this.timestamp) { this.make_panels(time); break; } }
            for (let panel of this.panels) for (let live_string of panel.querySelectorAll(".live_string")) live_string.onload(live_string);
            this.event = window.requestAnimFrame(this.render.bind(this));
        }
    }
