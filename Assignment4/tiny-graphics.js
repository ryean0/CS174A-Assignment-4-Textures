/**
 * @file A file that shows how to organize a complete graphics program.
 * It wraps common WebGL commands and math.
 * The file tiny-graphics-widgets.js additionally wraps web page interactions.  By Garrett.
 */

export const tiny = {};

const Vector = tiny.Vector =
    class Vector extends Float32Array {
        static create(...arr) { return new Vector(arr); }
        static cast(...args) { return args.map(x => Vector.from(x)) }
        copy() { return new Vector(this) }
        equals(b) { return this.every((x, i) => x == b[i]) }
        plus(b) { return this.map((x, i) => x + b[i]) }
        minus(b) { return this.map((x, i) => x - b[i]) }
        times_pairwise(b) { return this.map((x, i) => x * b[i]) }
        scale_by(s) { this.forEach((x, i, a) => a[i] *= s) }
        times(s) { return this.map(x => s * x) }
        randomized(s) { return this.map(x => x + s * (Math.random() - .5)) }
        mix(b, s) { return this.map((x, i) => (1 - s) * x + s * b[i]) }
        norm() { return Math.sqrt(this.dot(this)) }
        normalized() { return this.times(1 / this.norm()) }
        normalize() { this.scale_by(1 / this.norm()) }
        dot(b) { if (this.length == 2) return this[0] * b[0] + this[1] * b[1]; return this.reduce((acc, x, i) => acc + x * b[i], 0); }
        to3() { return vec3(this[0], this[1], this[2]); }
        to4(is_a_point) { return vec4(this[0], this[1], this[2], +is_a_point); }
        cross(b) { return vec3(this[1] * b[2] - this[2] * b[1], this[2] * b[0] - this[0] * b[2], this[0] * b[1] - this[1] * b[0]); }
        to_string() { return "[vector " + this.join(", ") + "]" }
    }

const Vector3 = tiny.Vector3 =
    class Vector3 extends Float32Array {
        static create(x, y, z) { const v = new Vector3(3); v[0] = x; v[1] = y; v[2] = z; return v; }
        static cast(...args) { return args.map(x => Vector3.from(x)); }
        copy() { return Vector3.from(this) }
        equals(b) { return this[0] == b[0] && this[1] == b[1] && this[2] == b[2] }
        plus(b) { return vec3(this[0] + b[0], this[1] + b[1], this[2] + b[2]) }
        minus(b) { return vec3(this[0] - b[0], this[1] - b[1], this[2] - b[2]) }
        times(s) { return vec3(this[0] * s, this[1] * s, this[2] * s) }
        times_pairwise(b) { return vec3(this[0] * b[0], this[1] * b[1], this[2] * b[2]) }
        add_by(b) { this[0] += b[0]; this[1] += b[1]; this[2] += b[2] }
        subtract_by(b) { this[0] -= b[0]; this[1] -= b[1]; this[2] -= b[2] }
        scale_by(s) { this[0] *= s; this[1] *= s; this[2] *= s }
        norm() { return Math.sqrt(this[0] * this[0] + this[1] * this[1] + this[2] * this[2]) }
        normalized() { const d = 1 / this.norm(); return vec3(this[0] * d, this[1] * d, this[2] * d); }
        normalize() { const d = 1 / this.norm(); this[0] *= d; this[1] *= d; this[2] *= d; }
        dot(b) { return this[0] * b[0] + this[1] * b[1] + this[2] * b[2] }
        cross(b) { return vec3(this[1] * b[2] - this[2] * b[1], this[2] * b[0] - this[0] * b[2], this[0] * b[1] - this[1] * b[0]) }
        to4(is_a_point) { return vec4(this[0], this[1], this[2], +is_a_point) }
        to_string() { return "[vec3 " + this.join(", ") + "]" }
    }

const Vector4 = tiny.Vector4 =
    class Vector4 extends Float32Array {
        static create(x, y, z, w) { const v = new Vector4(4); v[0] = x; v[1] = y; v[2] = z; v[3] = w; return v; }
        copy() { return Vector4.from(this) }
        equals(b) { return this[0] == b[0] && this[1] == b[1] && this[2] == b[2] && this[3] == b[3] }
        plus(b) { return vec4(this[0] + b[0], this[1] + b[1], this[2] + b[2], this[3] + b[3]) }
        minus(b) { return vec4(this[0] - b[0], this[1] - b[1], this[2] - b[2], this[3] - b[3]) }
        times(s) { return vec4(this[0] * s, this[1] * s, this[2] * s, this[3] * s) }
        times_pairwise(b) { return vec4(this[0] * b[0], this[1] * b[1], this[2] * b[2], this[3] * b[3]) }
        scale_by(s) { this[0] *= s; this[1] *= s; this[2] *= s; this[3] *= s }
        norm() { return Math.sqrt(this[0] * this[0] + this[1] * this[1] + this[2] * this[2]) }
        normalized() { const d = 1 / this.norm(); return vec4(this[0] * d, this[1] * d, this[2] * d, this[3]); }
        dot(b) { return this[0] * b[0] + this[1] * b[1] + this[2] * b[2] + this[3] * b[3] }
        to3() { return vec3(this[0], this[1], this[2]) }
        to_string() { return "[vec4 " + this.join(", ") + "]" }
    }

const vec = tiny.vec = Vector.create;
const vec3 = tiny.vec3 = Vector3.create;
const vec4 = tiny.vec4 = Vector4.create;

const Color = tiny.Color =
    class Color extends Vector4 {
        static create_from_float(r, g, b, a) { const v = new Vector4(4); v[0] = r; v[1] = g; v[2] = b; v[3] = a; return v; }
        static create_from_hex(hex, alpha = 1.) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            const v = new Vector4(4);
            if (result) { v[0] = parseInt(result[1], 16) / 255.; v[1] = parseInt(result[2], 16) / 255.; v[2] = parseInt(result[3], 16) / 255.; v[3] = alpha; }
            return v;
        }
    }

const color = tiny.color = Color.create_from_float;
const hex_color = tiny.hex_color = Color.create_from_hex;

const Matrix = tiny.Matrix =
    class Matrix extends Array {
        constructor(...args) { super(0); this.push(...args) }
        static flatten_2D_to_1D(M) { let index = 0, floats = new Float32Array(M.length && M.length * M[0].length); for (let i = 0; i < M.length; i++) for (let j = 0; j < M[i].length; j++) floats[index++] = M[i][j]; return floats; }
        set(M) { this.length = 0; this.push(...M); }
        set_identity(m, n) { this.length = 0; for (let i = 0; i < m; i++) { this.push(Array(n).fill(0)); if (i < n) this[i][i] = 1; } }
        copy() { return this.map(r => [...r]) }
        equals(b) { return this.every((r, i) => r.every((x, j) => x == b[i][j])) }
        plus(b) { return this.map((r, i) => r.map((x, j) => x + b[i][j])) }
        minus(b) { return this.map((r, i) => r.map((x, j) => x - b[i][j])) }
        transposed() { return this.map((r, i) => r.map((x, j) => this[j][i])) }
        times(b, optional_preallocated_result) {
            const len = b.length;
            if (typeof len === "undefined") return this.map(r => r.map(x => b * x));
            const len2 = b[0].length;
            if (typeof len2 === "undefined") { let result = optional_preallocated_result || new Vector4(this.length); for (let r = 0; r < len; r++) result[r] = b.dot(this[r]); return result; }
            let result = optional_preallocated_result || Matrix.from(new Array(this.length));
            for (let r = 0; r < this.length; r++) { if (!optional_preallocated_result) result[r] = new Array(len2); for (let c = 0; c < len2; c++) { result[r][c] = 0; for (let r2 = 0; r2 < len; r2++) result[r][c] += this[r][r2] * b[r2][c]; } }
            return result;
        }
        pre_multiply(b) { const new_value = b.times(this); this.length = 0; this.push(...new_value); return this; }
        post_multiply(b) { const new_value = this.times(b); this.length = 0; this.push(...new_value); return this; }
        to_string() { return "[" + this.map((r, i) => "[" + r.join(", ") + "]").join(" ") + "]" }
    }

const Mat4 = tiny.Mat4 =
    class Mat4 extends Matrix {
        static identity() { return Matrix.of([1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]); };
        static rotation(angle, x, y, z) {
            const normalize = (x, y, z) => { const n = Math.sqrt(x * x + y * y + z * z); return [x / n, y / n, z / n] }
            let [i, j, k] = normalize(x, y, z), [c, s] = [Math.cos(angle), Math.sin(angle)], omc = 1.0 - c;
            return Matrix.of([i * i * omc + c, i * j * omc - k * s, i * k * omc + j * s, 0], [i * j * omc + k * s, j * j * omc + c, j * k * omc - i * s, 0], [i * k * omc - j * s, j * k * omc + i * s, k * k * omc + c, 0], [0, 0, 0, 1]);
        }
        static scale(x, y, z) { return Matrix.of([x, 0, 0, 0], [0, y, 0, 0], [0, 0, z, 0], [0, 0, 0, 1]); }
        static translation(x, y, z) { return Matrix.of([1, 0, 0, x], [0, 1, 0, y], [0, 0, 1, z], [0, 0, 0, 1]); }
        static look_at(eye, at, up) {
            let z = at.minus(eye).normalized(), x = z.cross(up).normalized(), y = x.cross(z).normalized();
            if (!x.every(i => i == i)) throw "Two parallel vectors were given";
            z.scale_by(-1);
            return Mat4.translation(-x.dot(eye), -y.dot(eye), -z.dot(eye)).times(Matrix.of(x.to4(0), y.to4(0), z.to4(0), vec4(0, 0, 0, 1)));
        }
        static perspective(fov_y, aspect, near, far) {
            const f = 1 / Math.tan(fov_y / 2), d = far - near;
            return Matrix.of([f / aspect, 0, 0, 0], [0, f, 0, 0], [0, 0, -(near + far) / d, -2 * near * far / d], [0, 0, -1, 0]);
        }
        static inverse(m) {
            const result = Mat4.identity(), m00 = m[0][0], m01 = m[0][1], m02 = m[0][2], m03 = m[0][3],
                m10 = m[1][0], m11 = m[1][1], m12 = m[1][2], m13 = m[1][3],
                m20 = m[2][0], m21 = m[2][1], m22 = m[2][2], m23 = m[2][3],
                m30 = m[3][0], m31 = m[3][1], m32 = m[3][2], m33 = m[3][3];
            result[0][0] = m12 * m23 * m31 - m13 * m22 * m31 + m13 * m21 * m32 - m11 * m23 * m32 - m12 * m21 * m33 + m11 * m22 * m33;
            result[0][1] = m03 * m22 * m31 - m02 * m23 * m31 - m03 * m21 * m32 + m01 * m23 * m32 + m02 * m21 * m33 - m01 * m22 * m33;
            result[0][2] = m02 * m13 * m31 - m03 * m12 * m31 + m03 * m11 * m32 - m01 * m13 * m32 - m02 * m11 * m33 + m01 * m12 * m33;
            result[0][3] = m03 * m12 * m21 - m02 * m13 * m21 - m03 * m11 * m22 + m01 * m13 * m22 + m02 * m11 * m23 - m01 * m12 * m23;
            result[1][0] = m13 * m22 * m30 - m12 * m23 * m30 - m13 * m20 * m32 + m10 * m23 * m32 + m12 * m20 * m33 - m10 * m22 * m33;
            result[1][1] = m02 * m23 * m30 - m03 * m22 * m30 + m03 * m20 * m32 - m00 * m23 * m32 - m02 * m20 * m33 + m00 * m22 * m33;
            result[1][2] = m03 * m12 * m30 - m02 * m13 * m30 - m03 * m10 * m32 + m00 * m13 * m32 + m02 * m10 * m33 - m00 * m12 * m33;
            result[1][3] = m02 * m13 * m20 - m03 * m12 * m20 + m03 * m10 * m22 - m00 * m13 * m22 - m02 * m10 * m23 + m00 * m12 * m23;
            result[2][0] = m11 * m23 * m30 - m13 * m21 * m30 + m13 * m20 * m31 - m10 * m23 * m31 - m11 * m20 * m33 + m10 * m21 * m33;
            result[2][1] = m03 * m21 * m30 - m01 * m23 * m30 - m03 * m20 * m31 + m00 * m23 * m31 + m01 * m20 * m33 - m00 * m21 * m33;
            result[2][2] = m01 * m13 * m30 - m03 * m11 * m30 + m03 * m10 * m31 - m00 * m13 * m31 - m01 * m10 * m33 + m00 * m11 * m33;
            result[2][3] = m03 * m11 * m20 - m01 * m13 * m20 - m03 * m10 * m21 + m00 * m13 * m21 + m01 * m10 * m23 - m00 * m11 * m23;
            result[3][0] = m12 * m21 * m30 - m11 * m22 * m30 - m12 * m20 * m31 + m10 * m22 * m31 + m11 * m20 * m32 - m10 * m21 * m32;
            result[3][1] = m01 * m22 * m30 - m02 * m21 * m30 + m02 * m20 * m31 - m00 * m22 * m31 - m01 * m20 * m32 + m00 * m21 * m32;
            result[3][2] = m02 * m11 * m30 - m01 * m12 * m30 - m02 * m10 * m31 + m00 * m12 * m31 + m01 * m10 * m32 - m00 * m11 * m32;
            result[3][3] = m01 * m12 * m20 - m02 * m11 * m20 + m02 * m10 * m21 - m00 * m12 * m21 - m01 * m10 * m22 + m00 * m11 * m22;
            return result.times(1 / (m00 * result[0][0] + m10 * result[0][1] + m20 * result[0][2] + m30 * result[0][3]));
        }
    }

const Keyboard_Manager = tiny.Keyboard_Manager =
    class Keyboard_Manager {
        constructor(target = document, callback_behavior = (callback, event) => callback(event)) {
            this.saved_controls = {}; this.actively_pressed_keys = new Set(); this.callback_behavior = callback_behavior;
            target.addEventListener("keydown", this.key_down_handler.bind(this));
            target.addEventListener("keyup", this.key_up_handler.bind(this));
            window.addEventListener("focus", () => this.actively_pressed_keys.clear());
        }
        key_down_handler(event) {
            if (["INPUT", "TEXTAREA"].includes(event.target.tagName)) return;
            this.actively_pressed_keys.add(event.key);
            for (let saved of Object.values(this.saved_controls)) {
                if (saved.shortcut_combination.every(s => this.actively_pressed_keys.has(s)) && event.ctrlKey == saved.shortcut_combination.includes("Control") && event.shiftKey == saved.shortcut_combination.includes("Shift") && event.altKey == saved.shortcut_combination.includes("Alt") && event.metaKey == saved.shortcut_combination.includes("Meta"))
                    this.callback_behavior(saved.callback, event);
            }
        }
        key_up_handler(event) {
            const lower_symbols = "qwertyuiopasdfghjklzxcvbnm1234567890-=[]\\;',./", upper_symbols = "QWERTYUIOPASDFGHJKLZXCVBNM!@#$%^&*()_+{}|:\"<>?";
            const lifted_key_symbols = [event.key, upper_symbols[lower_symbols.indexOf(event.key)], lower_symbols[upper_symbols.indexOf(event.key)]];
            for (let saved of Object.values(this.saved_controls)) if (lifted_key_symbols.some(s => saved.shortcut_combination.includes(s))) this.callback_behavior(saved.keyup_callback, event);
            lifted_key_symbols.forEach(k => this.actively_pressed_keys.delete(k));
        }
        add(shortcut_combination, callback = () => {}, keyup_callback = () => {}) { this.saved_controls[shortcut_combination.join('+')] = {shortcut_combination, callback, keyup_callback}; }
    }

const Graphics_Card_Object = tiny.Graphics_Card_Object =
    class Graphics_Card_Object {
        constructor() { this.gpu_instances = new Map() }
        copy_onto_graphics_card(context, intial_gpu_representation) {
            const existing_instance = this.gpu_instances.get(context);
            if (!existing_instance) { Graphics_Card_Object.idiot_alarm |= 0; if (Graphics_Card_Object.idiot_alarm++ > 200) throw `Error: Too many GPU objects`; }
            return existing_instance || this.gpu_instances.set(context, intial_gpu_representation).get(context);
        }
        activate(context, ...args) { return this.gpu_instances.get(context) || this.copy_onto_graphics_card(context, ...args) }
    }

const Vertex_Buffer = tiny.Vertex_Buffer =
    class Vertex_Buffer extends Graphics_Card_Object {
        constructor(...array_names) { super(); [this.arrays, this.indices] = [{}, []]; for (let name of array_names) this.arrays[name] = []; }
        copy_onto_graphics_card(context, selection_of_arrays = Object.keys(this.arrays), write_to_indices = true) {
            const initial_gpu_representation = {webGL_buffer_pointers: {}};
            const did_exist = this.gpu_instances.get(context);
            const gpu_instance = super.copy_onto_graphics_card(context, initial_gpu_representation);
            const gl = context;
            const write = did_exist ? (target, data) => gl.bufferSubData(target, 0, data) : (target, data) => gl.bufferData(target, data, gl.STATIC_DRAW);
            for (let name of selection_of_arrays) { if (!did_exist) gpu_instance.webGL_buffer_pointers[name] = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, gpu_instance.webGL_buffer_pointers[name]); write(gl.ARRAY_BUFFER, Matrix.flatten_2D_to_1D(this.arrays[name])); }
            if (this.indices.length && write_to_indices) { if (!did_exist) gpu_instance.index_buffer = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gpu_instance.index_buffer); write(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.indices)); }
            return gpu_instance;
        }
        execute_shaders(gl, gpu_instance, type) { if (this.indices.length) { gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gpu_instance.index_buffer); gl.drawElements(gl[type], this.indices.length, gl.UNSIGNED_INT, 0) } else gl.drawArrays(gl[type], 0, Object.values(this.arrays)[0].length); }
        draw(webgl_manager, program_state, model_transform, material, type = "TRIANGLES") {
            const gpu_instance = this.activate(webgl_manager.context);
            material.shader.activate(webgl_manager.context, gpu_instance.webGL_buffer_pointers, program_state, model_transform, material);
            this.execute_shaders(webgl_manager.context, gpu_instance, type);
        }
    }

const Shape = tiny.Shape =
    class Shape extends Vertex_Buffer {
        static insert_transformed_copy_into(recipient, args, points_transform = Mat4.identity()) {
            const temp_shape = new this(...args);
            recipient.indices.push(...temp_shape.indices.map(i => i + recipient.arrays.position.length));
            for (let a in temp_shape.arrays) {
                if (a == "position" || a == "tangents") recipient.arrays[a].push(...temp_shape.arrays[a].map(p => points_transform.times(p.to4(1)).to3()));
                else if (a == "normal") recipient.arrays[a].push(...temp_shape.arrays[a].map(n => Mat4.inverse(points_transform.transposed()).times(n.to4(1)).to3()));
                else recipient.arrays[a].push(...temp_shape.arrays[a]);
            }
        }
    }

const Light = tiny.Light = class Light { constructor(position, color, size) { Object.assign(this, {position, color, attenuation: 1 / size}); } }

const Graphics_Addresses = tiny.Graphics_Addresses =
    class Graphics_Addresses {
        constructor(program, gl) {
            const num_uniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
            for (let i = 0; i < num_uniforms; ++i) { let u = gl.getActiveUniform(program, i).name.split('[')[0]; this[u] = gl.getUniformLocation(program, u); }
            this.shader_attributes = {};
            const type_to_size_mapping = {0x1406: 1, 0x8B50: 2, 0x8B51: 3, 0x8B52: 4};
            const numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
            for (let i = 0; i < numAttribs; i++) { const attribInfo = gl.getActiveAttrib(program, i); this.shader_attributes[attribInfo.name] = {index: gl.getAttribLocation(program, attribInfo.name), size: type_to_size_mapping[attribInfo.type], enabled: true, type: gl.FLOAT, normalized: false, stride: 0, pointer: 0}; }
        }
    }

const Container = tiny.Container = class Container { override(replacement) { return this.helper(replacement, Object.create(this.constructor.prototype)) } replace(replacement) { return this.helper(replacement, this) } helper(replacement, target) { Object.assign(target, this); if (replacement.constructor === Object) return Object.assign(target, replacement); const matching_keys_by_type = Object.entries(this).filter(([key, value]) => replacement instanceof value.constructor); if (!matching_keys_by_type[0]) throw "Container: Can't figure out which value you're trying to replace"; return Object.assign(target, {[matching_keys_by_type[0][0]]: replacement}); } }

const Material = tiny.Material = class Material extends Container { constructor(shader, options) { super(); Object.assign(this, {shader}, options); } }

const Shader = tiny.Shader =
    class Shader extends Graphics_Card_Object {
        copy_onto_graphics_card(context) {
            const initial_gpu_representation = {program: undefined, gpu_addresses: undefined, vertShdr: undefined, fragShdr: undefined};
            const gpu_instance = super.copy_onto_graphics_card(context, initial_gpu_representation);
            const gl = context;
            const program = gpu_instance.program || context.createProgram();
            const vertShdr = gpu_instance.vertShdr || gl.createShader(gl.VERTEX_SHADER);
            const fragShdr = gpu_instance.fragShdr || gl.createShader(gl.FRAGMENT_SHADER);
            if (gpu_instance.vertShdr) gl.detachShader(program, vertShdr);
            if (gpu_instance.fragShdr) gl.detachShader(program, fragShdr);
            gl.shaderSource(vertShdr, this.vertex_glsl_code()); gl.compileShader(vertShdr);
            if (!gl.getShaderParameter(vertShdr, gl.COMPILE_STATUS)) throw "Vertex shader compile error: " + gl.getShaderInfoLog(vertShdr);
            gl.shaderSource(fragShdr, this.fragment_glsl_code()); gl.compileShader(fragShdr);
            if (!gl.getShaderParameter(fragShdr, gl.COMPILE_STATUS)) throw "Fragment shader compile error: " + gl.getShaderInfoLog(fragShdr);
            gl.attachShader(program, vertShdr); gl.attachShader(program, fragShdr); gl.linkProgram(program);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw "Shader linker error: " + gl.getProgramInfoLog(this.program);
            Object.assign(gpu_instance, {program, vertShdr, fragShdr, gpu_addresses: new Graphics_Addresses(program, gl)});
            return gpu_instance;
        }
        activate(context, buffer_pointers, program_state, model_transform, material) {
            const gpu_instance = super.activate(context);
            context.useProgram(gpu_instance.program);
            this.update_GPU(context, gpu_instance.gpu_addresses, program_state, model_transform, material);
            for (let [attr_name, attribute] of Object.entries(gpu_instance.gpu_addresses.shader_attributes)) {
                if (!attribute.enabled) { if (attribute.index >= 0) context.disableVertexAttribArray(attribute.index); continue; }
                context.enableVertexAttribArray(attribute.index);
                context.bindBuffer(context.ARRAY_BUFFER, buffer_pointers[attr_name]);
                context.vertexAttribPointer(attribute.index, attribute.size, attribute.type, attribute.normalized, attribute.stride, attribute.pointer);
            }
        }
        vertex_glsl_code() {}
        fragment_glsl_code() {}
        update_GPU() {}
    }

const Texture = tiny.Texture =
    class Texture extends Graphics_Card_Object {
        constructor(filename, min_filter = "LINEAR_MIPMAP_LINEAR") {
            super();
            Object.assign(this, {filename, min_filter});
            this.image = new Image();
            this.image.onload = () => this.ready = true;
            this.image.crossOrigin = "Anonymous";
            this.image.src = filename;
        }
        copy_onto_graphics_card(context, need_initial_settings = true) {
            const initial_gpu_representation = {texture_buffer_pointer: undefined};
            const gpu_instance = super.copy_onto_graphics_card(context, initial_gpu_representation);
            if (!gpu_instance.texture_buffer_pointer) gpu_instance.texture_buffer_pointer = context.createTexture();
            const gl = context;
            gl.bindTexture(gl.TEXTURE_2D, gpu_instance.texture_buffer_pointer);
            if (need_initial_settings) { gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl[this.min_filter]); }
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
            if (this.min_filter == "LINEAR_MIPMAP_LINEAR") gl.generateMipmap(gl.TEXTURE_2D);
            return gpu_instance;
        }
        activate(context, texture_unit = 0) {
            if (!this.ready) return;
            const gpu_instance = super.activate(context);
            context.activeTexture(context["TEXTURE" + texture_unit]);
            context.bindTexture(context.TEXTURE_2D, gpu_instance.texture_buffer_pointer);
        }
    }

const Program_State = tiny.Program_State =
    class Program_State extends Container {
        constructor(camera_transform = Mat4.identity(), projection_transform = Mat4.identity()) { super(); this.set_camera(camera_transform); const defaults = {projection_transform, animate: true, animation_time: 0, animation_delta_time: 0}; Object.assign(this, defaults); }
        set_camera(matrix) { Object.assign(this, {camera_transform: Mat4.inverse(matrix), camera_inverse: matrix}) }
    }

const Webgl_Manager = tiny.Webgl_Manager =
    class Webgl_Manager {
        constructor(canvas, background_color, dimensions) {
            const members = {instances: new Map(), scenes: [], prev_time: 0, canvas, scratchpad: {}, program_state: new Program_State()};
            Object.assign(this, members);
            for (let name of ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"]) { this.context = this.canvas.getContext(name); if (this.context) break; }
            if (!this.context) throw "Canvas failed to make a WebGL context.";
            const gl = this.context;
            this.set_size(dimensions);
            gl.clearColor.apply(gl, background_color); gl.getExtension("OES_element_index_uint"); gl.enable(gl.DEPTH_TEST); gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            gl.bindTexture(gl.TEXTURE_2D, gl.createTexture()); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255]));
            window.requestAnimFrame = (w => w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.mozRequestAnimationFrame || w.oRequestAnimationFrame || w.msRequestAnimationFrame || function (callback) { w.setTimeout(callback, 1000 / 60); })(window);
        }
        set_size(dimensions = [1080, 600]) { const [width, height] = dimensions; this.canvas.style["width"] = width + "px"; this.canvas.style["height"] = height + "px"; Object.assign(this, {width, height}); Object.assign(this.canvas, {width, height}); this.context.viewport(0, 0, width, height); }
        render(time = 0) {
            this.program_state.animation_delta_time = time - this.prev_time;
            if (this.program_state.animate) this.program_state.animation_time += this.program_state.animation_delta_time;
            this.prev_time = time;
            const gl = this.context; gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            const open_list = [...this.scenes];
            while (open_list.length) { open_list.push(...open_list[0].children); open_list.shift().display(this, this.program_state); }
            this.event = window.requestAnimFrame(this.render.bind(this));
        }
    }

const Scene = tiny.Scene =
    class Scene {
        constructor() {
            this.children = [];
            const callback_behavior = (callback, event) => { callback(event); event.preventDefault(); event.stopPropagation(); }
            this.key_controls = new Keyboard_Manager(document, callback_behavior);
        }
        new_line(parent = this.control_panel) { parent.appendChild(document.createElement("br")) }
        live_string(callback, parent = this.control_panel) { parent.appendChild(Object.assign(document.createElement("div"), {className: "live_string", onload: callback})); }
        key_triggered_button(description, shortcut_combination, callback, color = '#6E6460', release_event, recipient = this, parent = this.control_panel) {
            const button = parent.appendChild(document.createElement("button"));
            button.default_color = button.style.backgroundColor = color;
            const press = () => { Object.assign(button.style, {'background-color': color, 'z-index': "1", 'transform': "scale(1.5)"}); callback.call(recipient); },
                release = () => { Object.assign(button.style, {'background-color': button.default_color, 'z-index': "0", 'transform': "scale(1)"}); if (release_event) release_event.call(recipient); };
            const key_name = shortcut_combination.join('+').split(" ").join("Space");
            button.textContent = "(" + key_name + ") " + description;
            button.addEventListener("mousedown", press); button.addEventListener("mouseup", release);
            button.addEventListener("touchstart", press, {passive: true}); button.addEventListener("touchend", release, {passive: true});
            if (shortcut_combination) this.key_controls.add(shortcut_combination, press, release);
        }
        display(context, program_state) {}
        make_control_panel() {}
        show_explanation(document_section) {}
    }
