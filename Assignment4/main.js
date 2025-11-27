import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;

const {Cube, Axis_Arrows, Textured_Phong} = defs

export class Assignment4 extends Scene {
    /**
     *  **Base_scene** is a Scene that can be added to any display canvas.
     *  Setup the shapes, materials, camera, and lighting here.
     */
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        // TODO:  Create two cubes, including one with the default texture coordinates (from 0 to 1), and one with the modified
        //        texture coordinates as required for cube #2.  You can either do this by modifying the cube code or by modifying
        //        a cube instance's texture_coords after it is already created.
        this.shapes = {
            box_1: new Cube(),
            box_2: new Cube(),
            axis: new Axis_Arrows()
        }

        // Modify texture coordinates for box_2 to zoom out by 50% (texture appears 4 times)
        this.shapes.box_2.arrays.texture_coord = this.shapes.box_2.arrays.texture_coord.map(x => x.times(2));

        // TODO 1.a: Load texture map
        // Create the materials required to texture both cubes with the correct images and settings.
        // Make each Material from the correct shader. Phong_Shader will work initially, but when
        // you get to requirements 6 and 7 you will need different ones.
        this.materials = {
            phong: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
            }),
            // Texture for cube #1: uses NEAREST filtering (nearest neighbor sampling)
            // Set ambient to 1 and color to black so texture appears with original colors
            texture_1: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/stars.png", "NEAREST")
            }),
            // Texture for cube #2: uses tri-linear filtering with mip mapping
            // Set ambient to 1 and color to black so texture appears with original colors
            texture_2: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/earth.gif", "LINEAR_MIPMAP_LINEAR")
            }),
        }

        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 20), vec3(0, 0, 0), vec3(0, 1, 0));
    }

    make_control_panel() {
        // TODO:  Implement requirement #5 using a key_triggered_button that responds to the 'c' key.
    }

    display(context, program_state) {
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(Mat4.translation(0, 0, -8));
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);

        const light_position = vec4(10, 10, 10, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

        let t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        let model_transform = Mat4.identity();

        // TODO:  Draw the required boxes. Also update their stored matrices.
        // Draw cube #1 at position (-2, 0, 0)
        let box_1_transform = model_transform.times(Mat4.translation(-2, 0, 0));
        this.shapes.box_1.draw(context, program_state, box_1_transform, this.materials.texture_1);

        // Draw cube #2 at position (2, 0, 0)
        let box_2_transform = model_transform.times(Mat4.translation(2, 0, 0));
        this.shapes.box_2.draw(context, program_state, box_2_transform, this.materials.texture_2);
    }
}
