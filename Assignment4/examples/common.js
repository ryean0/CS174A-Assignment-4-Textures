import {tiny} from '../tiny-graphics.js';
import {widgets} from '../tiny-graphics-widgets.js';
const {Vector, Vector3, vec, vec3, vec4, color, Matrix, Mat4, Light, Shape, Material, Shader, Texture, Scene} = tiny;
Object.assign(tiny, widgets);
const defs = {};
export {tiny, defs};

const Square = defs.Square =
    class Square extends Shape {
        constructor() {
            super("position", "normal", "texture_coord");
            this.arrays.position = Vector3.cast([-1, -1, 0], [1, -1, 0], [-1, 1, 0], [1, 1, 0]);
            this.arrays.normal = Vector3.cast([0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1]);
            this.arrays.texture_coord = Vector.cast([0, 0], [1, 0], [0, 1], [1, 1]);
            this.indices.push(0, 1, 2, 1, 3, 2);
        }
    }

const Cube = defs.Cube =
    class Cube extends Shape {
        constructor() {
            super("position", "normal", "texture_coord");
            for (let i = 0; i < 3; i++)
                for (let j = 0; j < 2; j++) {
                    const square_transform = Mat4.rotation(i == 0 ? Math.PI / 2 : 0, 1, 0, 0)
                        .times(Mat4.rotation(Math.PI * j - (i == 1 ? Math.PI / 2 : 0), 0, 1, 0))
                        .times(Mat4.translation(0, 0, 1));
                    Square.insert_transformed_copy_into(this, [], square_transform);
                }
        }
    }

const Subdivision_Sphere = defs.Subdivision_Sphere =
    class Subdivision_Sphere extends Shape {
        constructor(max_subdivisions) {
            super("position", "normal", "texture_coord");
            const tetrahedron = [[0, 0, -1], [0, .9428, .3333], [-.8165, -.4714, .3333], [.8165, -.4714, .3333]];
            this.arrays.position = Vector3.cast(...tetrahedron);
            this.subdivide_triangle(0, 1, 2, max_subdivisions);
            this.subdivide_triangle(3, 2, 1, max_subdivisions);
            this.subdivide_triangle(1, 0, 3, max_subdivisions);
            this.subdivide_triangle(0, 2, 3, max_subdivisions);
            for (let p of this.arrays.position) {
                this.arrays.normal.push(p.copy());
                this.arrays.texture_coord.push(Vector.of(0.5 - Math.atan2(p[2], p[0]) / (2 * Math.PI), 0.5 + Math.asin(p[1]) / Math.PI));
            }
        }
        subdivide_triangle(a, b, c, count) {
            if (count <= 0) { this.indices.push(a, b, c); return; }
            let ab_vert = this.arrays.position[a].mix(this.arrays.position[b], 0.5).normalized(),
                ac_vert = this.arrays.position[a].mix(this.arrays.position[c], 0.5).normalized(),
                bc_vert = this.arrays.position[b].mix(this.arrays.position[c], 0.5).normalized();
            let ab = this.arrays.position.push(ab_vert) - 1, ac = this.arrays.position.push(ac_vert) - 1, bc = this.arrays.position.push(bc_vert) - 1;
            this.subdivide_triangle(a, ab, ac, count - 1);
            this.subdivide_triangle(ab, b, bc, count - 1);
            this.subdivide_triangle(ac, bc, c, count - 1);
            this.subdivide_triangle(ab, bc, ac, count - 1);
        }
    }

const Cylindrical_Tube = defs.Cylindrical_Tube =
    class Cylindrical_Tube extends Shape {
        constructor(rows, columns) {
            super("position", "normal", "texture_coord");
            const circle_points = Array(rows + 1).fill(vec3(1, 0, 0.5));
            for (let i = 0; i <= rows; i++) { const ratio = i / rows; circle_points[i] = vec3(1, 0, 0.5 - ratio); }
            for (let j = 0; j <= columns; j++) {
                const angle = 2 * Math.PI * j / columns;
                for (let i = 0; i <= rows; i++) {
                    const p = vec3(Math.cos(angle), Math.sin(angle), circle_points[i][2]);
                    this.arrays.position.push(p);
                    this.arrays.normal.push(vec3(Math.cos(angle), Math.sin(angle), 0));
                    this.arrays.texture_coord.push(vec(j / columns, i / rows));
                }
            }
            for (let j = 0; j < columns; j++) for (let i = 0; i < rows; i++) {
                const a = j * (rows + 1) + i, b = a + 1, c = (j + 1) * (rows + 1) + i, d = c + 1;
                this.indices.push(a, c, b, b, c, d);
            }
        }
    }

const Closed_Cone = defs.Closed_Cone =
    class Closed_Cone extends Shape {
        constructor(rows, columns) {
            super("position", "normal", "texture_coord");
            for (let j = 0; j <= columns; j++) {
                const angle = 2 * Math.PI * j / columns;
                for (let i = 0; i <= rows; i++) {
                    const ratio = i / rows;
                    const p = vec3(Math.cos(angle) * (1 - ratio), Math.sin(angle) * (1 - ratio), -1 + 2 * ratio);
                    this.arrays.position.push(p);
                    this.arrays.normal.push(vec3(Math.cos(angle), Math.sin(angle), 0.5).normalized());
                    this.arrays.texture_coord.push(vec(j / columns, i / rows));
                }
            }
            for (let j = 0; j < columns; j++) for (let i = 0; i < rows; i++) {
                const a = j * (rows + 1) + i, b = a + 1, c = (j + 1) * (rows + 1) + i, d = c + 1;
                this.indices.push(a, c, b, b, c, d);
            }
        }
    }

const Axis_Arrows = defs.Axis_Arrows =
    class Axis_Arrows extends Shape {
        constructor() {
            super("position", "normal", "texture_coord");
            Subdivision_Sphere.insert_transformed_copy_into(this, [3], Mat4.rotation(Math.PI / 2, 0, 1, 0).times(Mat4.scale(.25, .25, .25)));
            this.drawOneAxis(Mat4.identity());
            this.drawOneAxis(Mat4.rotation(-Math.PI / 2, 1, 0, 0).times(Mat4.scale(1, -1, 1)));
            this.drawOneAxis(Mat4.rotation(Math.PI / 2, 0, 1, 0).times(Mat4.scale(-1, 1, 1)));
        }
        drawOneAxis(transform) {
            Closed_Cone.insert_transformed_copy_into(this, [4, 10], transform.times(Mat4.translation(0, 0, 2)).times(Mat4.scale(.25, .25, .25)));
            Cube.insert_transformed_copy_into(this, [], transform.times(Mat4.translation(.95, .95, .45)).times(Mat4.scale(.05, .05, .45)));
            Cube.insert_transformed_copy_into(this, [], transform.times(Mat4.translation(.95, 0, .5)).times(Mat4.scale(.05, .05, .4)));
            Cube.insert_transformed_copy_into(this, [], transform.times(Mat4.translation(0, .95, .5)).times(Mat4.scale(.05, .05, .4)));
            Cylindrical_Tube.insert_transformed_copy_into(this, [7, 7], transform.times(Mat4.translation(0, 0, 1)).times(Mat4.scale(.1, .1, 2)));
        }
    }

const Phong_Shader = defs.Phong_Shader =
    class Phong_Shader extends Shader {
        constructor(num_lights = 2) { super(); this.num_lights = num_lights; }
        shared_glsl_code() {
            return `precision mediump float;
                const int N_LIGHTS = ` + this.num_lights + `;
                uniform float ambient, diffusivity, specularity, smoothness;
                uniform vec4 light_positions_or_vectors[N_LIGHTS], light_colors[N_LIGHTS];
                uniform float light_attenuation_factors[N_LIGHTS];
                uniform vec4 shape_color;
                uniform vec3 squared_scale, camera_center;
                varying vec3 N, vertex_worldspace;
                vec3 phong_model_lights( vec3 N, vec3 vertex_worldspace ){
                    vec3 E = normalize( camera_center - vertex_worldspace );
                    vec3 result = vec3( 0.0 );
                    for(int i = 0; i < N_LIGHTS; i++){
                        vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz - light_positions_or_vectors[i].w * vertex_worldspace;
                        float distance_to_light = length( surface_to_light_vector );
                        vec3 L = normalize( surface_to_light_vector );
                        vec3 H = normalize( L + E );
                        float diffuse  = max( dot( N, L ), 0.0 );
                        float specular = pow( max( dot( N, H ), 0.0 ), smoothness );
                        float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light );
                        vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse + light_colors[i].xyz * specularity * specular;
                        result += attenuation * light_contribution;
                    }
                    return result;
                }`;
        }
        vertex_glsl_code() {
            return this.shared_glsl_code() + `
                attribute vec3 position, normal;
                uniform mat4 model_transform;
                uniform mat4 projection_camera_model_transform;
                void main(){
                    gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
                    N = normalize( mat3( model_transform ) * normal / squared_scale);
                    vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;
                }`;
        }
        fragment_glsl_code() {
            return this.shared_glsl_code() + `
                void main(){
                    gl_FragColor = vec4( shape_color.xyz * ambient, shape_color.w );
                    gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
                }`;
        }
        send_material(gl, gpu, material) {
            gl.uniform4fv(gpu.shape_color, material.color);
            gl.uniform1f(gpu.ambient, material.ambient);
            gl.uniform1f(gpu.diffusivity, material.diffusivity);
            gl.uniform1f(gpu.specularity, material.specularity);
            gl.uniform1f(gpu.smoothness, material.smoothness);
        }
        send_gpu_state(gl, gpu, gpu_state, model_transform) {
            const O = vec4(0, 0, 0, 1), camera_center = gpu_state.camera_transform.times(O).to3();
            gl.uniform3fv(gpu.camera_center, camera_center);
            const squared_scale = model_transform.reduce((acc, r) => acc.plus(vec4(...r).times_pairwise(r)), vec4(0, 0, 0, 0)).to3();
            gl.uniform3fv(gpu.squared_scale, squared_scale);
            const PCM = gpu_state.projection_transform.times(gpu_state.camera_inverse).times(model_transform);
            gl.uniformMatrix4fv(gpu.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
            gl.uniformMatrix4fv(gpu.projection_camera_model_transform, false, Matrix.flatten_2D_to_1D(PCM.transposed()));
            if (!gpu_state.lights.length) return;
            const light_positions_flattened = [], light_colors_flattened = [];
            for (let i = 0; i < 4 * gpu_state.lights.length; i++) { light_positions_flattened.push(gpu_state.lights[Math.floor(i / 4)].position[i % 4]); light_colors_flattened.push(gpu_state.lights[Math.floor(i / 4)].color[i % 4]); }
            gl.uniform4fv(gpu.light_positions_or_vectors, light_positions_flattened);
            gl.uniform4fv(gpu.light_colors, light_colors_flattened);
            gl.uniform1fv(gpu.light_attenuation_factors, gpu_state.lights.map(l => l.attenuation));
        }
        update_GPU(context, gpu_addresses, gpu_state, model_transform, material) {
            const defaults = {color: color(0, 0, 0, 1), ambient: 0, diffusivity: 1, specularity: 1, smoothness: 40};
            material = Object.assign({}, defaults, material);
            this.send_material(context, gpu_addresses, material);
            this.send_gpu_state(context, gpu_addresses, gpu_state, model_transform);
        }
    }

const Textured_Phong = defs.Textured_Phong =
    class Textured_Phong extends Phong_Shader {
        vertex_glsl_code() {
            return this.shared_glsl_code() + `
                varying vec2 f_tex_coord;
                attribute vec3 position, normal;
                attribute vec2 texture_coord;
                uniform mat4 model_transform;
                uniform mat4 projection_camera_model_transform;
                void main(){
                    gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
                    N = normalize( mat3( model_transform ) * normal / squared_scale);
                    vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;
                    f_tex_coord = texture_coord;
                }`;
        }
        fragment_glsl_code() {
            return this.shared_glsl_code() + `
                varying vec2 f_tex_coord;
                uniform sampler2D texture;
                uniform float animation_time;
                void main(){
                    vec4 tex_color = texture2D( texture, f_tex_coord );
                    if( tex_color.w < .01 ) discard;
                    gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, shape_color.w * tex_color.w );
                    gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
                }`;
        }
        update_GPU(context, gpu_addresses, gpu_state, model_transform, material) {
            super.update_GPU(context, gpu_addresses, gpu_state, model_transform, material);
            context.uniform1f(gpu_addresses.animation_time, gpu_state.animation_time / 1000);
            if (material.texture && material.texture.ready) {
                context.uniform1i(gpu_addresses.texture, 0);
                material.texture.activate(context);
            }
        }
    }

const Movement_Controls = defs.Movement_Controls =
    class Movement_Controls extends Scene {
        constructor() {
            super();
            const data_members = {roll: 0, look_around_locked: true, thrust: vec3(0, 0, 0), pos: vec3(0, 0, 0), z_axis: vec3(0, 0, 0), radians_per_frame: 1 / 200, meters_per_frame: 20, speed_multiplier: 1};
            Object.assign(this, data_members);
            this.mouse_enabled_canvases = new Set();
            this.will_take_over_graphics_state = true;
        }
        set_recipient(matrix_closure, inverse_closure) { this.matrix = matrix_closure; this.inverse = inverse_closure; }
        reset(graphics_state) { this.set_recipient(() => graphics_state.camera_transform, () => graphics_state.camera_inverse); }
        add_mouse_controls(canvas) {
            this.mouse = {"from_center": vec(0, 0)};
            const mouse_position = (e, rect = canvas.getBoundingClientRect()) => vec(e.clientX - (rect.left + rect.right) / 2, e.clientY - (rect.bottom + rect.top) / 2);
            document.addEventListener("mouseup", e => { this.mouse.anchor = undefined; });
            canvas.addEventListener("mousedown", e => { e.preventDefault(); this.mouse.anchor = mouse_position(e); });
            canvas.addEventListener("mousemove", e => { e.preventDefault(); this.mouse.from_center = mouse_position(e); });
            canvas.addEventListener("mouseout", e => { if (!this.mouse.anchor) this.mouse.from_center.scale_by(0) });
        }
        make_control_panel() {
            this.control_panel.innerHTML += "Click and drag the scene to spin your viewpoint around it.<br>";
            this.key_triggered_button("Up", [" "], () => this.thrust[1] = -1, undefined, () => this.thrust[1] = 0);
            this.key_triggered_button("Forward", ["w"], () => this.thrust[2] = 1, undefined, () => this.thrust[2] = 0);
            this.new_line();
            this.key_triggered_button("Left", ["a"], () => this.thrust[0] = 1, undefined, () => this.thrust[0] = 0);
            this.key_triggered_button("Back", ["s"], () => this.thrust[2] = -1, undefined, () => this.thrust[2] = 0);
            this.key_triggered_button("Right", ["d"], () => this.thrust[0] = -1, undefined, () => this.thrust[0] = 0);
            this.new_line();
            this.key_triggered_button("Down", ["z"], () => this.thrust[1] = 1, undefined, () => this.thrust[1] = 0);
        }
        first_person_flyaround(radians_per_frame, meters_per_frame, leeway = 70) {
            const offsets_from_dead_box = {plus: [this.mouse.from_center[0] + leeway, this.mouse.from_center[1] + leeway], minus: [this.mouse.from_center[0] - leeway, this.mouse.from_center[1] - leeway]};
            if (!this.look_around_locked)
                for (let i = 0; i < 2; i++) { let o = offsets_from_dead_box, velocity = ((o.minus[i] > 0 && o.minus[i]) || (o.plus[i] < 0 && o.plus[i])) * radians_per_frame; this.matrix().post_multiply(Mat4.rotation(-velocity, i, 1 - i, 0)); this.inverse().pre_multiply(Mat4.rotation(+velocity, i, 1 - i, 0)); }
            this.matrix().post_multiply(Mat4.rotation(-.1 * this.roll, 0, 0, 1));
            this.inverse().pre_multiply(Mat4.rotation(+.1 * this.roll, 0, 0, 1));
            this.matrix().post_multiply(Mat4.translation(...this.thrust.times(-meters_per_frame)));
            this.inverse().pre_multiply(Mat4.translation(...this.thrust.times(+meters_per_frame)));
        }
        third_person_arcball(radians_per_frame) {
            const dragging_vector = this.mouse.from_center.minus(this.mouse.anchor);
            if (dragging_vector.norm() <= 0) return;
            this.matrix().post_multiply(Mat4.translation(0, 0, -25));
            this.inverse().pre_multiply(Mat4.translation(0, 0, +25));
            const rotation = Mat4.rotation(radians_per_frame * dragging_vector.norm(), dragging_vector[1], dragging_vector[0], 0);
            this.matrix().post_multiply(rotation);
            this.inverse().pre_multiply(rotation);
            this.matrix().post_multiply(Mat4.translation(0, 0, +25));
            this.inverse().pre_multiply(Mat4.translation(0, 0, -25));
        }
        display(context, graphics_state, dt = graphics_state.animation_delta_time / 1000) {
            const m = this.speed_multiplier * this.meters_per_frame, r = this.speed_multiplier * this.radians_per_frame;
            if (this.will_take_over_graphics_state) { this.reset(graphics_state); this.will_take_over_graphics_state = false; }
            if (!this.mouse_enabled_canvases.has(context.canvas)) { this.add_mouse_controls(context.canvas); this.mouse_enabled_canvases.add(context.canvas) }
            this.first_person_flyaround(dt * r, dt * m);
            if (this.mouse.anchor) this.third_person_arcball(dt * r);
            this.pos = this.inverse().times(vec4(0, 0, 0, 1));
            this.z_axis = this.inverse().times(vec4(0, 0, 1, 0));
        }
    }
